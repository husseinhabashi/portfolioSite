import { type NextRequest, NextResponse } from "next/server"
import { getSql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // 🔐 Check admin session
    const adminSession = request.cookies.get("admin_session")?.value

    if (!adminSession || adminSession.trim().length === 0) {
      console.warn("[leak-tracking] Missing or invalid admin_session cookie")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Math.min(Number(searchParams.get("limit")) || 100, 1000) // 🔒 prevent abuse

    const sql = getSql()
    const leaks = await sql`
      SELECT 
        lt.id,
        lt.canary_token,
        lt.session_id,
        lt.resource_type,
        lt.resource_path,
        lt.accessed_at,
        lt.access_ips,
        lt.session_fingerprint,
        lt.referer,
        lt.signature,
        lt.user_agent,
        s.ip_address AS session_ip,
        i.email
      FROM leak_tracking lt
      LEFT JOIN sessions s ON lt.session_fingerprint = s.session_fingerprint
      LEFT JOIN invites i ON s.invite_id = i.id
      ORDER BY lt.accessed_at DESC
      LIMIT ${limit}
    `

    return NextResponse.json({
      success: true,
      total: leaks.length,
      leaks,
    })
  } catch (error) {
    console.error("[v0] Error fetching leak tracking data:", error)
    return NextResponse.json({ error: "Failed to fetch leak tracking data" }, { status: 500 })
  }
}