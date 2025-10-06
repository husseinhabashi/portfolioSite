/**
 * Database utilities for PostgreSQL operations
 * Uses Neon serverless driver for edge-compatible queries
 */

import { neon, type NeonQueryFunction } from "@neondatabase/serverless"

let _sql: NeonQueryFunction<false, false> | null = null

export function getSql(): NeonQueryFunction<false, false> {
  if (!_sql) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set")
    }
    _sql = neon(process.env.DATABASE_URL)
  }
  return _sql
}

/**
 * Database types
 */
export interface Invite {
  id: number
  email: string
  invite_hash: string
  signature: string
  created_at: Date
  expires_at: Date | null
  is_active: boolean
  used: boolean
}

export interface Session {
  id: number
  invite_id: number
  session_fingerprint: string
  ip_address: string
  user_agent: string | null
  first_seen: Date
  last_seen: Date
  is_active: boolean
}

export interface IpBinding {
  id: number
  invite_id: number
  bound_ip: string
  bound_at: Date
}

export interface AuditLog {
  id: number
  event_type: string
  invite_hash: string | null
  session_id: string | null
  ip_address: string | null
  user_agent: string | null
  details: Record<string, any> | null
  created_at: Date
}

export interface LeakTracking {
  id: number
  session_fingerprint: string
  asset_url: string
  signature: string
  accessed_at: Date
  ip_address: string | null
  user_agent: string | null
}

export interface AdminKey {
  id: number
  public_key: string
  key_name: string | null
  created_at: Date
  is_active: boolean
}

/**
 * Database operations
 */

// Invite operations
export async function createInvite(email: string, inviteHash: string, signature: string, expiresAt?: Date) {
  const sql = getSql()
  const result = await sql`
    INSERT INTO invites (email, invite_hash, signature, expires_at)
    VALUES (${email}, ${inviteHash}, ${signature}, ${expiresAt || null})
    RETURNING *
  `
  return result[0] as Invite
}

export async function getInviteByHash(inviteHash: string) {
  const sql = getSql()
  const result = await sql`
    SELECT * FROM invites
    WHERE invite_hash = ${inviteHash} 
      AND is_active = true 
      AND used = false
      AND (expires_at IS NULL OR expires_at > NOW())
    LIMIT 1
  `
  return result[0] as Invite | undefined
}

export async function getInviteById(id: number) {
  const sql = getSql()
  const result = await sql`
    SELECT * FROM invites
    WHERE id = ${id}
    LIMIT 1
  `
  return result[0] as Invite | undefined
}

// Session operations
export async function createSession(
  inviteId: number,
  sessionFingerprint: string,
  ipAddress: string,
  userAgent: string,
) {
  const sql = getSql()
  const result = await sql`
    INSERT INTO sessions (invite_id, session_fingerprint, ip_address, user_agent)
    VALUES (${inviteId}, ${sessionFingerprint}, ${ipAddress}, ${userAgent})
    RETURNING *
  `
  return result[0] as Session
}

export async function getSessionByFingerprint(fingerprint: string) {
  const sql = getSql()
  const result = await sql`
    SELECT * FROM sessions
    WHERE session_fingerprint = ${fingerprint} AND is_active = true
    LIMIT 1
  `
  return result[0] as Session | undefined
}

export async function updateSessionLastSeen(fingerprint: string) {
  const sql = getSql()
  await sql`
    UPDATE sessions
    SET last_seen = CURRENT_TIMESTAMP
    WHERE session_fingerprint = ${fingerprint}
  `
}

// IP binding operations
export async function createIpBinding(inviteId: number, boundIp: string) {
  const sql = getSql()
  const result = await sql`
    INSERT INTO ip_bindings (invite_id, bound_ip)
    VALUES (${inviteId}, ${boundIp})
    ON CONFLICT (invite_id) DO UPDATE SET bound_ip = ${boundIp}
    RETURNING *
  `
  return result[0] as IpBinding
}

export async function getIpBinding(inviteId: number) {
  const sql = getSql()
  const result = await sql`
    SELECT * FROM ip_bindings
    WHERE invite_id = ${inviteId}
    LIMIT 1
  `
  return result[0] as IpBinding | undefined
}

// Audit log operations
export async function createAuditLog(
  eventType: string,
  inviteHash: string | null,
  sessionId: string | null,
  ipAddress: string | null,
  userAgent: string | null,
  details?: Record<string, any>,
) {
  const sql = getSql()
  await sql`
    INSERT INTO audit_logs (event_type, invite_hash, session_id, ip_address, user_agent, details)
    VALUES (${eventType}, ${inviteHash}, ${sessionId}, ${ipAddress}, ${userAgent}, ${JSON.stringify(details || {})})
  `
}

// Leak tracking operations
export async function createLeakTrack(
  sessionFingerprint: string,
  assetUrl: string,
  signature: string,
  ipAddress: string | null,
  userAgent: string | null,
) {
  const sql = getSql()
  await sql`
    INSERT INTO leak_tracking (session_fingerprint, asset_url, signature, ip_address, user_agent)
    VALUES (${sessionFingerprint}, ${assetUrl}, ${signature}, ${ipAddress}, ${userAgent})
  `
}

export async function getLeakTracksBySignature(signature: string) {
  const sql = getSql()
  const result = await sql`
    SELECT * FROM leak_tracking
    WHERE signature = ${signature}
    ORDER BY accessed_at DESC
  `
  return result as LeakTracking[]
}

// Admin key operations
export async function createAdminKey(publicKey: string, keyName?: string) {
  const sql = getSql()
  const result = await sql`
    INSERT INTO admin_keys (public_key, key_name)
    VALUES (${publicKey}, ${keyName || null})
    RETURNING *
  `
  return result[0] as AdminKey
}

export async function getAdminKeyByPublicKey(publicKey: string) {
  const sql = getSql()
  const result = await sql`
    SELECT * FROM admin_keys
    WHERE public_key = ${publicKey} AND is_active = true
    LIMIT 1
  `
  return result[0] as AdminKey | undefined
}

export async function getAllActiveAdminKeys() {
  const sql = getSql()
  const result = await sql`
    SELECT * FROM admin_keys
    WHERE is_active = true
    ORDER BY created_at DESC
  `
  return result as AdminKey[]
}
