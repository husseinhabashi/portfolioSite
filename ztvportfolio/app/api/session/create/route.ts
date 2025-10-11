import { type NextRequest, NextResponse } from "next/server"
import { signData, verifySignature } from "@/lib/crypto"
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
import { getServerPrivateKey, getServerPublicKey } from "@/lib/env"

export async function POST(request: NextRequest) {
  try {
    const { inviteHash, fingerprint, signature } = await request.json()

    if (!inviteHash || !fingerprint || !signature) {
      return NextResponse.json(
        { error: "Missing inviteHash, fingerprint, or signature" },
        { status: 400 }
      )
    }

    // 🔎 Collect environment info
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1"
    const userAgent = request.headers.get("user-agent") || "unknown"

    // 🧠 1️⃣ Verify that the client fingerprint was signed by the server (authentic invite)
    const publicKey = getServerPublicKey()
    const isValid = verifySignature(fingerprint, signature, publicKey)

    if (!isValid) {
      await createAuditLog("session_creation_failed", inviteHash, null, ip, userAgent, {
        reason: "Invalid signed fingerprint (forged client signature)",
      })
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    // 📨 2️⃣ Load invite from DB
    const invite = await getInviteByHash(inviteHash)
    if (!invite) {
      await createAuditLog("session_creation_failed", null, null, ip, userAgent, {
        reason: "Invite not found",
      })
      return NextResponse.json({ error: "Invite not found" }, { status: 404 })
    }

    // 🕒 3️⃣ Check IP binding
    const existingBinding = await getIpBinding(inviteHash)
    if (existingBinding && existingBinding.bound_ip !== ip) {
      await createAuditLog("ip_mismatch", inviteHash, null, ip, userAgent, {
        boundIp: existingBinding.bound_ip,
        requestIp: ip,
      })
      return NextResponse.json({ error: "IP mismatch" }, { status: 403 })
    }

    if (!existingBinding) {
      await createIpBinding(inviteHash, ip)
      await createAuditLog("ip_binding_created", inviteHash, null, ip, userAgent, { boundIp: ip })
    }

    // 🧾 4️⃣ Check if this fingerprint already has a session
    const existingSession = await getSessionByFingerprint(fingerprint)
    let sessionId: string

    if (existingSession) {
      sessionId = existingSession.session_id
      await updateSessionLastSeen(fingerprint)
      await createAuditLog("session_resumed", inviteHash, sessionId, ip, userAgent)
    } else {
      const newSession = await createSession(inviteHash, fingerprint, ip, userAgent)
      sessionId = newSession.session_id
      await createAuditLog("session_created", inviteHash, sessionId, ip, userAgent)
      await markInviteUsed(inviteHash)
    }

    // ✍️ 5️⃣ Server re-signs fingerprint to create a durable session signature
    const privateKey = getServerPrivateKey()
    const signedFingerprint = signData(fingerprint, privateKey)

    // ✅ 6️⃣ Respond with signed session data
    const response = NextResponse.json({
      success: true,
      sessionId,
      sessionFingerprint: fingerprint,
      signedSession: signedFingerprint,
      redirect: "/main",
    })

    // Optional: minimal session cookie
    response.cookies.set("session_fingerprint", fingerprint, {
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