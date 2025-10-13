import { NextResponse } from "next/server"
import { createInviteHash, generateNonce, signData } from "@/lib/crypto"
import { createInvite } from "@/lib/db"
import { getSql } from "@/lib/db"
import { randomBytes } from "crypto"
import { getServerPrivateKey } from "@/lib/env"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 })
    }

    const sql = getSql()
    const timestamp = Date.now()
    const nonce = generateNonce()
    const inviteHash = createInviteHash(email, timestamp, nonce)
    const privateKey = getServerPrivateKey()
    const signature = signData(inviteHash, privateKey)

    // Store invite in DB
    const invite = await createInvite(email, inviteHash, signature, undefined)

    // Create one-time token (10 min)
    const token = randomBytes(32).toString("hex")
    await sql`
      INSERT INTO invite_tokens (invite_hash, token)
      VALUES (${inviteHash}, ${token})
    `

    console.log(`[invite] ✅ One-time link generated for ${email}`)

    return NextResponse.json({
      success: true,
      invite: { email, inviteHash, signature },
      oneTimeUrl: `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`,
    })
  } catch (err) {
    console.error("[invite] ❌ Error generating invite:", err)
    return NextResponse.json({ error: "Failed to generate invite" }, { status: 500 })
  }
}