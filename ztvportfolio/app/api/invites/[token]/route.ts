import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"

export async function GET(_req: Request, { params }: { params: { token: string } }) {
  const sql = getSql()

  try {
    // 🔍 Fetch the token and invite info
    const result = await sql`
      SELECT it.*, i.email, i.invite_hash, i.signature, i.expires_at
      FROM invite_tokens it
      JOIN invites i ON i.invite_hash = it.invite_hash
      WHERE it.token = ${params.token}
      LIMIT 1
    `

    const tokenData = result[0]

    // ❌ Invalid token
    if (!tokenData)
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 404 })

    // ⚠️ Already used or expired
    if (tokenData.used || (tokenData.expires_at && new Date(tokenData.expires_at) < new Date()))
      return NextResponse.json({ error: "Token already used or expired" }, { status: 410 })

    // ✅ Mark as used (self-destruct)
    await sql`
      UPDATE invite_tokens
      SET used = TRUE, used_at = NOW()
      WHERE token = ${params.token}
    `

    // 🧾 Return invite data (for one-time display)
    return NextResponse.json({
      success: true,
      invite: {
        email: tokenData.email,
        inviteHash: tokenData.invite_hash,
        signature: tokenData.signature,
        expiresAt: tokenData.expires_at,
      },
    })
  } catch (err) {
    console.error("[invite-token] ❌ Error fetching invite token:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}