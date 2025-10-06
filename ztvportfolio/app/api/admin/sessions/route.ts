import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Check admin session
    const adminSession = request.cookies.get("admin_session")?.value

    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all sessions with invite information
    const sessions = await sql`
      SELECT 
        s.id,
        s.session_fingerprint,
        s.ip_address,
        s.user_agent,
        s.first_seen,
        s.last_seen,
        s.is_active,
        i.email,
        i.invite_hash
      FROM sessions s
      JOIN invites i ON s.invite_id = i.id
      WHERE s.is_active = true
      ORDER BY s.last_seen DESC
    `

    return NextResponse.json({
      success: true,
      sessions,
    })
  } catch (error) {
    console.error("[v0] Error fetching sessions:", error)
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 })
  }
}
