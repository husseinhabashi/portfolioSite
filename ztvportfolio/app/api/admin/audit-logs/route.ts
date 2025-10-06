/**
 * API route to get audit logs (admin only)
 * GET /api/admin/audit-logs?limit=100
 */

import { type NextRequest, NextResponse } from "next/server"
import { getSql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Check admin session
    const adminSession = request.cookies.get("admin_session")?.value

    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "100")

    const sql = getSql()

    // Get recent audit logs
    const logs = await sql`
      SELECT *
      FROM audit_logs
      ORDER BY created_at DESC
      LIMIT ${limit}
    `

    return NextResponse.json({
      success: true,
      logs,
    })
  } catch (error) {
    console.error("[v0] Error fetching audit logs:", error)
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 })
  }
}
