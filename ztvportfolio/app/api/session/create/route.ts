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

    // Get client information
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() || request.headers.get("x-real-ip") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    // Verify signature
    const publicKey = getServerPublicKey()
    const isValidSignature = verifySignature(inviteHash, signature, publicKey)

    if (!isValidSignature) {
      await createAuditLog("session_creation_failed", null, null, ip, userAgent, {
        reason: "Invalid signature",
      })
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    // Get invite from database
    const invite = await getInviteByHash(inviteHash)

    if (!invite) {
      await createAuditLog("session_creation_failed", null, null, ip, userAgent, {
        reason: "Invite not found",
      })
      return NextResponse.json({ error: "Invite not found" }, { status: 404 })
    }

    // Check IP binding
    const existingBinding = await getIpBinding(invite.id)

    if (existingBinding) {
      // IP binding exists - verify it matches
      if (existingBinding.bound_ip !== ip) {
        await createAuditLog("ip_mismatch", invite.id, null, ip, userAgent, {
          boundIp: existingBinding.bound_ip,
          requestIp: ip,
        })
        return NextResponse.json(
          {
            error: "IP address mismatch. This invite is bound to a different IP address.",
          },
          { status: 403 },
        )
      }
    } else {
      // First use - create IP binding
      await createIpBinding(invite.id, ip)
      await createAuditLog("ip_binding_created", invite.id, null, ip, userAgent, {
        boundIp: ip,
      })
      console.log("[v0] IP binding created for invite:", invite.id, "IP:", ip)
    }

    // Create session fingerprint
    const timestamp = Date.now()
    const sessionFingerprint = createSessionFingerprint(ip, userAgent, inviteHash, timestamp)

    // Check if session already exists
    const existingSession = await getSessionByFingerprint(sessionFingerprint)

    if (existingSession) {
      // Update last seen
      await updateSessionLastSeen(sessionFingerprint)
      await createAuditLog("session_resumed", invite.id, sessionFingerprint, ip, userAgent)
      console.log("[v0] Session resumed:", sessionFingerprint)
    } else {
      // Create new session
      await createSession(invite.id, sessionFingerprint, ip, userAgent)
      await createAuditLog("session_created", invite.id, sessionFingerprint, ip, userAgent)
      console.log("[v0] New session created:", sessionFingerprint)
    }

    // Set session cookie
    const response = NextResponse.json({
      success: true,
      sessionFingerprint,
      email: invite.email,
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
    console.error("[v0] Error creating session:", error)
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
  }
}
