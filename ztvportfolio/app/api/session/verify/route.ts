import { type NextRequest, NextResponse } from "next/server"
import { getSessionByFingerprint, updateSessionLastSeen, getIpBinding, createAuditLog } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const sessionFingerprint = request.cookies.get("session_fingerprint")?.value

    if (!sessionFingerprint) {
      return NextResponse.json({ error: "No session found" }, { status: 401 })
    }

    // Get client information
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() || request.headers.get("x-real-ip") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    // Get session from database
    const session = await getSessionByFingerprint(sessionFingerprint)

    if (!session) {
      await createAuditLog("session_not_found", null, sessionFingerprint, ip, userAgent)
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    // Verify IP binding
    const ipBinding = await getIpBinding(session.invite_id)

    if (ipBinding && ipBinding.bound_ip !== ip) {
      await createAuditLog(
        "ip_mismatch_session",
        String(session.invite_id),
        sessionFingerprint,
        ip,
        userAgent,
        {
      boundIp: ipBinding.bound_ip,
      requestIp: ip,
        }
    )
      return NextResponse.json(
        {
          error: "IP address mismatch. Your session is bound to a different IP.",
        },
        { status: 403 },
      )
    }

    // Update last seen
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
    console.error("[v0] Error verifying session:", error)
    return NextResponse.json({ error: "Failed to verify session" }, { status: 500 })
  }
}
