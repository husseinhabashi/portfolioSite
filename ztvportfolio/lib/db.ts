import type { Invite, Session, IpBinding, AuditLog, LeakTracking, AdminKey } from "./types/db"
import { neon } from "@neondatabase/serverless"
import crypto from "crypto"

// Define your own type instead of the nonexistent NeonQueryFunction
type SqlFunction = <T = any>(
  strings: TemplateStringsArray,
  ...values: any[]
) => Promise<T[]>

let _sql: SqlFunction | null = null

export function getSql(): SqlFunction {
  if (!_sql) {
    if (!process.env.DATABASE_URL)
      throw new Error("DATABASE_URL env var not set")
    _sql = neon(process.env.DATABASE_URL) as SqlFunction
  }
  return _sql
}

// ──────────────────────────────────────────────
// 👑 ADMIN KEYS
// ──────────────────────────────────────────────
export async function getAdminKeyByPublicKey(publicKey: string) {
  const sql = getSql()
  const result = await sql`
    SELECT * FROM admin_keys 
    WHERE public_key = ${publicKey} AND is_active = true 
    LIMIT 1
  `
  return result[0] || null
}

// ──────────────────────────────────────────────
// 📩 INVITES
// ──────────────────────────────────────────────
export async function createInvite(
  email: string,
  inviteHash: string,
  signature: string,
  expiresAt?: Date
) {
  const sql = getSql()
  const result = await sql`
    INSERT INTO invites (email, invite_hash, signature, expires_at)
    VALUES (${email}, ${inviteHash}, ${signature}, ${expiresAt || null})
    RETURNING *
  `
  return result[0]
}

export async function getInviteByHash(inviteHash: string) {
  const sql = getSql()
  const result = await sql`
    SELECT * FROM invites
    WHERE invite_hash = ${inviteHash.trim()}
    LIMIT 1
  `
  return result[0]
}

export async function markInviteUsed(inviteHash: string): Promise<boolean> {
  const sql = getSql()
  const updated = await sql`
    UPDATE invites
    SET used = TRUE, used_at = NOW()
    WHERE invite_hash = ${inviteHash.trim()} AND used = FALSE
    RETURNING id, used, used_at
  `

  if (updated.length > 0) {
    console.log("[invite] ✅ marked as used:", updated[0])
    return true
  } else {
    const still = await sql`
      SELECT id, used, used_at FROM invites 
      WHERE invite_hash = ${inviteHash.trim()} LIMIT 1
    `
    console.log("[invite] ⚠️ markInviteUsed: no update happened", still[0])
    return false
  }
}

// ──────────────────────────────────────────────
// 💾 SESSIONS
// ──────────────────────────────────────────────
export async function createSession(
  inviteHash: string,
  sessionFingerprint: string,
  ip: string,
  ua: string
) {
  const sql = getSql()
  const sessionId = crypto.randomBytes(32).toString("hex")

  const result = await sql`
    INSERT INTO sessions (
      session_id,
      invite_hash,
      session_fingerprint,
      ip_address,
      user_agent
    )
    VALUES (
      ${sessionId},
      ${inviteHash},
      ${sessionFingerprint},
      ${ip},
      ${ua}
    )
    RETURNING *
  `
  return result[0]
}

export async function getSessionByFingerprint(fingerprint: string) {
  const sql = getSql()
  const result = await sql`
    SELECT * FROM sessions 
    WHERE session_fingerprint = ${fingerprint} AND active = TRUE 
    LIMIT 1
  `
  return result[0]
}

export async function updateSessionLastSeen(fingerprint: string) {
  const sql = getSql()
  await sql`
    UPDATE sessions 
    SET last_seen = NOW() 
    WHERE session_fingerprint = ${fingerprint}
  `
}

// ──────────────────────────────────────────────
// 📡 Leak Tracking
// ──────────────────────────────────────────────
export async function createLeakTrack(
  sessionFingerprint: string | null,
  referer: string | null,
  signature: string,
  ip: string,
  userAgent: string
) {
  const sql = getSql()

  // Optional: try to map to an existing session
  let sessionId: string | null = null
  if (sessionFingerprint) {
    const session = await sql`
      SELECT session_id FROM sessions WHERE session_fingerprint = ${sessionFingerprint} LIMIT 1
    `
    sessionId = session[0]?.session_id || null
  }

  // Insert log even if no session found
  await sql`
    INSERT INTO leak_tracking (
      canary_token,
      session_id,
      resource_type,
      session_fingerprint,
      referer,
      signature,
      access_ips,
      user_agent,
      accessed_at
    )
    VALUES (
      ${crypto.randomBytes(32).toString("hex")},
      ${sessionId},
      'tracking_pixel',
      ${sessionFingerprint},
      ${referer},
      ${signature},
      ARRAY[${ip}],
      ${userAgent},
      NOW()
    )
  `
}

// ──────────────────────────────────────────────
// 🌐 IP Bindings
// ──────────────────────────────────────────────
export async function getIpBinding(inviteHash: string) {
  const sql = getSql()
  const result = await sql`
    SELECT * FROM ip_bindings 
    WHERE invite_hash = ${inviteHash}
    LIMIT 1
  `
  return result[0] as IpBinding | undefined
}

export async function createIpBinding(inviteHash: string, boundIp: string) {
  const sql = getSql()
  const result = await sql`
    INSERT INTO ip_bindings (invite_hash, ip_address, bound_ip, bound_at)
    VALUES (${inviteHash}, ${boundIp}, ${boundIp}, NOW())
    ON CONFLICT (invite_hash) DO UPDATE 
      SET ip_address = ${boundIp}, bound_ip = ${boundIp}, bound_at = NOW()
    RETURNING *
  `
  return result[0] as IpBinding
}

// ──────────────────────────────────────────────
// 🛡️ Audit Logs
// ──────────────────────────────────────────────
export async function createAuditLog(
  eventType: string,
  inviteHash: string | null,
  sessionId: string | null,
  ip: string | null,
  ua: string | null,
  details?: Record<string, any>
) {
  const sql = getSql()

  try {
    const detailsJson = details ? JSON.stringify(details) : "{}"

    console.log("[AUDIT] inserting:", {
      eventType,
      inviteHash,
      sessionId,
      ip,
      ua,
      details: detailsJson
    })

    await sql`
      INSERT INTO audit_logs (
        event_type,
        invite_hash,
        session_id,
        ip_address,
        user_agent,
        details
      ) VALUES (
        ${eventType},
        ${inviteHash},
        ${sessionId},
        ${ip},
        ${ua},
        ${detailsJson}::jsonb
      )
    `

    console.log("[AUDIT] ✅ successfully inserted")
  } catch (e) {
    console.error("[AUDIT] ❌ Failed to insert log:", e)
  }
}