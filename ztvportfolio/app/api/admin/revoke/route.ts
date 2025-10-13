import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { inviteHash } = await req.json()
    if (!inviteHash) return NextResponse.json({ error: "Missing invite hash" }, { status: 400 })

    const sql = getSql()
    await sql`UPDATE invites SET is_revoked = TRUE, revoked_at = NOW() WHERE invite_hash = ${inviteHash}`
    await sql`UPDATE sessions SET active = FALSE WHERE invite_hash = ${inviteHash}`

    console.log(`[revoke] 🚫 Invite revoked: ${inviteHash}`)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[revoke] ❌ Error revoking invite:", err)
    return NextResponse.json({ error: "Failed to revoke invite" }, { status: 500 })
  }
}