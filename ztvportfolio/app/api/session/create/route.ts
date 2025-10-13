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


    // ──────────────────────────────────────────────
    // 🌐 Robust IP Resolution — works across Vercel / Cloudflare / local
    // ──────────────────────────────────────────────
    const forwardedFor = request.headers.get("x-forwarded-for")
    const ip =
      forwardedFor
        ?.split(",")
        .map((i) => i.trim())
        .find(
          (i) =>
            i &&
            !i.startsWith("10.") &&
            !i.startsWith("172.") &&
            !i.startsWith("192.168")
        ) ||
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-real-ip") ||
      request.headers.get("x-vercel-forwarded-for") ||
      "127.0.0.1"

    const userAgent = request.headers.get("user-agent") || "unknown"

    // ──────────────────────────────────────────────
    // 1️⃣ Verify server-signed fingerprint (authentic client)
    // ──────────────────────────────────────────────
    const publicKey = getServerPublicKey()
    const isValid = verifySignature(fingerprint, signature, publicKey)
    if (!isValid) {
      await createAuditLog("session_creation_failed", inviteHash, null, ip, userAgent, {
        reason: "Invalid signed fingerprint (forged client signature)",
      })
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    // ──────────────────────────────────────────────
    // 2️⃣ Load invite
    // ──────────────────────────────────────────────
    const invite = await getInviteByHash(inviteHash)
    if (!invite) {
      await createAuditLog("session_creation_failed", null, null, ip, userAgent, {
        reason: "Invite not found",
      })
      return NextResponse.json({ error: "Invite not found" }, { status: 404 })
    }

    // ──────────────────────────────────────────────
    // 3️⃣ Enforce or create IP binding
    // ──────────────────────────────────────────────
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
      await createAuditLog("ip_binding_created", inviteHash, null, ip, userAgent, {
        boundIp: ip,
      })
    }

    // ──────────────────────────────────────────────
    // 4️⃣ Reuse or create session (invite-scoped only)
    // ──────────────────────────────────────────────
    const priorSession = await getSessionByFingerprint(fingerprint)
    let sessionId: string

    if (priorSession && priorSession.invite_hash === inviteHash) {
      sessionId = priorSession.session_id
      await updateSessionLastSeen(fingerprint)
      await createAuditLog("session_resumed", inviteHash, sessionId, ip, userAgent)
    } else {
      const newSession = await createSession(inviteHash, fingerprint, ip, userAgent)
      sessionId = newSession.session_id
      await createAuditLog("session_created", inviteHash, sessionId, ip, userAgent)
      await markInviteUsed(inviteHash)
    }

    // ──────────────────────────────────────────────
    // 5️⃣ Server re-signs fingerprint → durable session signature
    // ──────────────────────────────────────────────
    const privateKey = getServerPrivateKey()
    const signedFingerprint = signData(fingerprint, privateKey)
    const response = NextResponse.json({
  success: true,
  sessionId,
  sessionFingerprint: fingerprint,
  signedSession: signedFingerprint,
  redirect: "/main",
})

// add ephemeral trust cookies (httpOnly = false is fine since they’re signed)
response.cookies.set("zt_fingerprint", fingerprint, { path: "/", httpOnly: false })
response.cookies.set("zt_signature", signedFingerprint, { path: "/", httpOnly: false })

return response
    // ──────────────────────────────────────────────
    // 6️⃣ Respond — pure Zero-Trust, no cookies
    // ──────────────────────────────────────────────
    return NextResponse.json({
      success: true,
      sessionId,
      sessionFingerprint: fingerprint,
      signedSession: signedFingerprint,
      redirect: "/main",
    })
  } catch (error) {
    console.error("❌ Error creating session:", error)
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    )
  }
}

