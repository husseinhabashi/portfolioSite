import { type NextRequest, NextResponse } from "next/server"
import { getSessionByFingerprint, updateSessionLastSeen, getIpBinding, createAuditLog } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const sessionFingerprint = request.headers.get("x-session-fingerprint")

    if (!sessionFingerprint) {
      return NextResponse.json({ error: "No session fingerprint found" }, { status: 401 })
    }

    // 🧠 Client context
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

    // 🧩 Retrieve session
    const session = await getSessionByFingerprint(sessionFingerprint)
    if (!session) {
      await createAuditLog("session_not_found", null, sessionFingerprint, ip, userAgent)
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    // ✅ Lookup IP binding by invite_hash, not invite_id
    const ipBinding = await getIpBinding(session.invite_hash)

    if (ipBinding && ipBinding.bound_ip !== ip) {
      await createAuditLog("ip_mismatch_session", session.invite_hash, session.session_id, ip, userAgent, {
        boundIp: ipBinding.bound_ip,
        requestIp: ip,
      })
      return NextResponse.json(
        { error: "IP address mismatch — session bound to another IP" },
        { status: 403 }
      )
    }

    // 🧩 Update last seen time
    await updateSessionLastSeen(sessionFingerprint)

    return NextResponse.json({
      success: true,
      session: {
        fingerprint: session.session_fingerprint,
        ipAddress: session.ip_address,
        firstSeen: session.first_seen,
        lastSeen: session.last_seen,
      },
    })
  } catch (error) {
    console.error("❌ Error verifying session:", error)
    return NextResponse.json({ error: "Failed to verify session" }, { status: 500 })
  }
}