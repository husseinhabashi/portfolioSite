// /app/api/admin/ipbinding/route.ts
import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { inviteHash } = await req.json()

    if (!inviteHash) {
      return NextResponse.json({ error: "Missing inviteHash" }, { status: 400 })
    }

    const sql = getSql()
    const result = await sql`
      UPDATE ip_bindings
      SET ip_address = NULL, bound_ip = NULL, bound_at = NOW()
      WHERE invite_hash = ${inviteHash}
      RETURNING invite_hash, bound_ip, bound_at
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "No IP binding found for this invite" }, { status: 404 })
    }

    console.log(`[admin] ✅ IP binding cleared for invite ${inviteHash}`)

    return NextResponse.json({
      success: true,
      message: "IP binding removed successfully",
      data: result[0],
    })
  } catch (err) {
    console.error("[admin] ❌ Failed to remove IP binding:", err)
    return NextResponse.json({ error: "Failed to remove IP binding" }, { status: 500 })
  }
}