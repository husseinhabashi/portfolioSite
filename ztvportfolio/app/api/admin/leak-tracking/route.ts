import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Check admin session
    const adminSession = request.cookies.get("admin_session")?.value

    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "100")

    // Get leak tracking data with session information
    const leaks = await sql`
      SELECT 
        lt.*,
        s.ip_address as session_ip,
        i.email
      FROM leak_tracking lt
      LEFT JOIN sessions s ON lt.session_fingerprint = s.session_fingerprint
      LEFT JOIN invites i ON s.invite_id = i.id
      ORDER BY lt.accessed_at DESC
      LIMIT ${limit}
    `

    return NextResponse.json({
      success: true,
      leaks,
    })
  } catch (error) {
    console.error("[v0] Error fetching leak tracking data:", error)
    return NextResponse.json({ error: "Failed to fetch leak tracking data" }, { status: 500 })
  }
}
