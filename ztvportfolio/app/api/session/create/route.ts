import { type NextRequest, NextResponse } from "next/server"
import { createSessionFingerprint, verifySignature } from "@/lib/crypto"
import {
  getInviteByHash,
  createSession,
  createIpBinding,
  getIpBinding,
  createAuditLog,
  getSessionByFingerprint,
  updateSessionLastSeen,
  markInviteUsed,
} from "@/lib/db"
import { getServerPublicKey } from "@/lib/env"

export async function POST(request: NextRequest) {
  try {
    const { inviteHash, signature } = await request.json()

    // Client info (safe default on localhost)
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1"
    const userAgent = request.headers.get("user-agent") || "unknown"

    // Verify signature
    const publicKey = getServerPublicKey()
    const isValidSignature = verifySignature(inviteHash, signature, publicKey)
    if (!isValidSignature) {
      await createAuditLog("session_creation_failed", null, null, ip, userAgent, { reason: "Invalid signature" })
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    // Load invite
    const invite = await getInviteByHash(inviteHash)
    if (!invite) {
      await createAuditLog("session_creation_failed", null, null, ip, userAgent, { reason: "Invite not found" })
      return NextResponse.json({ error: "Invite not found" }, { status: 404 })
    }

    // If your DB funcs want a string id, keep this
    const invite_hash = invite.invite_hash

    // IP binding logic
    const existingBinding = await getIpBinding(invite_hash)
    if (existingBinding) {
      if (existingBinding.bound_ip !== ip) {
        await createAuditLog("ip_mismatch", invite_hash, null, ip, userAgent, {
          boundIp: existingBinding.bound_ip,
          requestIp: ip,
        })
        return NextResponse.json(
          { error: "IP mismatch. Invite is bound to a different IP." },
          { status: 403 }
        )
      }
    } else {
      await createIpBinding(invite_hash, ip)
      await createAuditLog("ip_binding_created", invite_hash, null, ip, userAgent, { boundIp: ip })
      console.log("✅ IP binding created for invite:", invite_hash, "IP:", ip)
    }

    // Session fingerprint
    const timestamp = Date.now()
    const sessionFingerprint = createSessionFingerprint(ip, userAgent, inviteHash, timestamp)

    // Create/resume session
    let sessionId: string | null = null
    const existingSession = await getSessionByFingerprint(sessionFingerprint)

    if (existingSession) {
      sessionId = existingSession.session_id
      await updateSessionLastSeen(sessionFingerprint)
      await createAuditLog("session_resumed", invite_hash, sessionId, ip, userAgent)
      console.log("🔄 Session resumed:", sessionId)
    } else {
      const newSession = await createSession(invite_hash, sessionFingerprint, ip, userAgent)
      sessionId = newSession.session_id
      await createAuditLog("session_created", invite_hash, sessionId, ip, userAgent)
      console.log("🆕 New session created:", sessionId)
    }

    // Mark invite as used (idempotent)
    const flipped = await markInviteUsed(invite.invite_hash)
    if (flipped) {
      await createAuditLog("invite_marked_used", invite.invite_hash, sessionFingerprint, ip, userAgent, {
        email: invite.email,
      })
       console.log("[DEBUG] markInviteUsed called with:", invite.invite_hash)
      
    } else {
      await createAuditLog("invite_already_used", invite.invite_hash, sessionFingerprint, ip, userAgent)
      console.log("Error marking invite as 'Used'")
    }

    // Build response with cookie + redirect path
    const response = NextResponse.json({
      success: true,
      sessionFingerprint,
      sessionId,
      redirect: "/main",
    })

    response.cookies.set("session_fingerprint", sessionFingerprint, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("❌ Error creating session:", error)
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
  }
}