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
} from "@/lib/db"
import { getServerPublicKey } from "@/lib/env"

export async function POST(request: NextRequest) {
  try {
    const { inviteHash, signature } = await request.json()

    // ✅ Capture client info (safe for localhost too)
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1"
    const userAgent = request.headers.get("user-agent") || "unknown"

    // ✅ Verify ECDSA signature
    const publicKey = getServerPublicKey()
    const isValidSignature = verifySignature(inviteHash, signature, publicKey)

    if (!isValidSignature) {
      await createAuditLog("session_creation_failed", null, null, ip, userAgent, {
        reason: "Invalid signature",
      })
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    // ✅ Get invite
    const invite = await getInviteByHash(inviteHash)
    if (!invite) {
      await createAuditLog("session_creation_failed", null, null, ip, userAgent, {
        reason: "Invite not found",
      })
      return NextResponse.json({ error: "Invite not found" }, { status: 404 })
    }

    const inviteId = String(invite.id) // 👈 FIX type issues once and for all

    // ✅ IP Binding Check
    const existingBinding = await getIpBinding(inviteId)
    if (existingBinding) {
      if (existingBinding.bound_ip !== ip) {
        await createAuditLog("ip_mismatch", inviteId, null, ip, userAgent, {
          boundIp: existingBinding.bound_ip,
          requestIp: ip,
        })
        return NextResponse.json(
          { error: "IP mismatch. Invite is bound to a different IP." },
          { status: 403 }
        )
      }
    } else {
      await createIpBinding(inviteId, ip)
      await createAuditLog("ip_binding_created", inviteId, null, ip, userAgent, { boundIp: ip })
      console.log("[v0] ✅ IP binding created for invite:", inviteId, "IP:", ip)
    }

    // ✅ Generate session fingerprint
    const timestamp = Date.now()
    const sessionFingerprint = createSessionFingerprint(ip, userAgent, inviteHash, timestamp)

    // ✅ Session handling
    const existingSession = await getSessionByFingerprint(sessionFingerprint)
    if (existingSession) {
      await updateSessionLastSeen(sessionFingerprint)
      await createAuditLog("session_resumed", inviteId, sessionFingerprint, ip, userAgent)
      console.log("[v0] 🔄 Session resumed:", sessionFingerprint)
    } else {
      await createSession(inviteId, sessionFingerprint, ip, userAgent)
      await createAuditLog("session_created", inviteId, sessionFingerprint, ip, userAgent)
      console.log("[v0] 🆕 New session created:", sessionFingerprint)
    }

    // ✅ Respond with cookie + redirect path
    const response = NextResponse.json({
      success: true,
      sessionFingerprint,
      email: invite.email,
      redirect: "/main", // 👈 critical for frontend router
    })

    response.cookies.set("session_fingerprint", sessionFingerprint, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("[v0] ❌ Error creating session:", error)
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
  }
}