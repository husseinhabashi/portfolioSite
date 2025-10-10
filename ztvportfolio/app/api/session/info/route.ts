import { type NextRequest, NextResponse } from "next/server"
import { getSessionByFingerprint } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const sessionFingerprint = request.cookies.get("session_fingerprint")?.value

    if (!sessionFingerprint) {
      return NextResponse.json({ error: "No session found" }, { status: 401 })
    }

    const session = await getSessionByFingerprint(sessionFingerprint)

    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    // Get invite details (we need to query by invite_id)
    // Since we don't have a direct query, we'll return session info without email
    // In a real implementation, you'd add a getInviteById function

    return NextResponse.json({
      success: true,
      session: {
        fingerprint: session.session_fingerprint,
        ipAddress: session.ip_address,
        userAgent: session.user_agent,
        firstSeen: session.first_seen,
        lastSeen: session.last_seen,
      },
    })
  } catch (error) {
    console.error("Error getting session info:", error)
    return NextResponse.json({ error: "Failed to get session info" }, { status: 500 })
  }
}