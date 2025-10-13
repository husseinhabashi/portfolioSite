import { NextResponse } from "next/server"
import { createInviteHash, signData } from "@/lib/crypto"
import { createInvite } from "@/lib/db"
import { randomBytes } from "crypto"

export async function POST(req: Request) {
  try {
    const { email, expiresInDays, bindIp } = await req.json()

    if (!email || !email.includes("@"))
      return NextResponse.json({ error: "Invalid email" }, { status: 400 })

    // 🧩 1. Core invite creation
    const timestamp = Date.now()
    const nonce = randomBytes(16).toString("hex")
    const inviteHash = createInviteHash(email, timestamp, nonce)

    const privateKey = process.env.SERVER_PRIVATE_KEY!
    const signature = signData(inviteHash, privateKey)

    const expiresAt =
  expiresInDays && expiresInDays > 0
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    : undefined

    await createInvite(email, inviteHash, signature, expiresAt ?? undefined)

    // 🧩 2. Create one-time token for recruiter
    const token = randomBytes(16).toString("hex")
    const sql = (await import("@/lib/db")).getSql()
    await sql`
      INSERT INTO invite_tokens (invite_hash, token, expires_at)
      VALUES (${inviteHash}, ${token}, NOW() + interval '1 day')
    `

    const oneTimeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`

    console.log(`[invite] ✅ New one-time invite for ${email}`)
    return NextResponse.json({
      success: true,
      invite: {
        email,
        inviteHash,
        signature,
        oneTimeUrl,
        expiresAt,
        bindIp,
      },
    })
  } catch (err) {
    console.error("[invite] ❌ Error:", err)
    return NextResponse.json({ error: "Failed to generate invite" }, { status: 500 })
  }
}