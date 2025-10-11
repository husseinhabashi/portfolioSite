import { type NextRequest, NextResponse } from "next/server"
import { verifySignature, signData } from "@/lib/crypto"
import { getInviteByHash, createAuditLog } from "@/lib/db"
import { getServerPrivateKey } from "@/lib/env"

export async function POST(request: NextRequest) {
  try {
    const { inviteHash, signature, fingerprint } = await request.json() as {
      inviteHash?: string
      signature?: string
      fingerprint?: string
    }

    if (!inviteHash || !signature || !fingerprint) {
      return NextResponse.json(
        { error: "Invite hash, signature, and fingerprint are required" },
        { status: 400 }
      )
    }

    // ── Client context for audit ───────────────────────────────────────────────
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1"
    const userAgent = request.headers.get("user-agent") || "unknown"

    // ── Lookup invite ─────────────────────────────────────────────────────────
    const invite = await getInviteByHash(inviteHash)
    if (!invite) {
      await safeLog("invite_not_found", inviteHash, ip, userAgent)
      return NextResponse.json({ error: "Invite not found" }, { status: 404 })
    }

    // ── Check expiry / active (do NOT require used=true here) ─────────────────
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      await safeLog("invite_expired", invite.invite_hash, ip, userAgent)
      return NextResponse.json({ error: "Invite expired" }, { status: 401 })
    }

    if (!invite.is_active) {
      await safeLog("invite_inactive", invite.invite_hash, ip, userAgent)
      return NextResponse.json({ error: "Invite inactive" }, { status: 401 })
    }

    // ── Verify the invite's signature (proof it was issued by server) ─────────
    // Client submits `signature` for `inviteHash`. We validate with server pubkey.
    const isValidInvite = verifySignature(
      inviteHash,
      signature,
      process.env.SERVER_PUBLIC_KEY as string
    )

    if (!isValidInvite) {
      await safeLog("signature_verification_failed", invite.invite_hash, ip, userAgent, "Invalid signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    // ── Sign the client's fingerprint (attestation used by /api/session/create) ─
    const privateKey = getServerPrivateKey() // throws if missing
    const signedSession = signData(fingerprint, privateKey)

    // ── Audit success ─────────────────────────────────────────────────────────
    await safeLog("invite_verified", invite.invite_hash, ip, userAgent, undefined)

    // ── Return the server-signed attestation ──────────────────────────────────
    return NextResponse.json({
      success: true,
      signedSession,                  // client will present this to /api/session/create
      invite: {
        email: invite.email,
        inviteHash: invite.invite_hash,
      },
      // redirect hint (client decides navigation)
      redirect: "/main",
    })
  } catch (error) {
    console.error("❌ Verify invite error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Small helper to safely log security events
async function safeLog(event: string, hash: string, ip: string, ua: string, reason?: string) {
  try {
    await createAuditLog(event, hash ?? null, null, ip ?? null, ua ?? null, { inviteHash: hash, reason })
  } catch (e) {
    console.error("⚠️ Audit log failed:", e)
  }
}