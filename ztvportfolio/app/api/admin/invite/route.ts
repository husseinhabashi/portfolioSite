// /app/api/admin/invite/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { createInviteHash, generateNonce, signData } from "@/lib/crypto"
import { createInvite, createIpBinding } from "@/lib/db"
import { getServerPrivateKey } from "@/lib/env"

export async function POST(request: NextRequest) {
  try {
    const { email, expiresInDays, bindIp } = await request.json()

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
    }

    const timestamp = Date.now()
    const nonce = generateNonce()
    const inviteHash = createInviteHash(email, timestamp, nonce)

    // Sign invite hash with server private key
    const privateKey = getServerPrivateKey()
    const signature = signData(inviteHash, privateKey)

    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : undefined

    // Create invite
    const invite = await createInvite(email, inviteHash, signature, expiresAt)

    const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")


    const oneTimeUrl = `${baseUrl}/invite?hash=${inviteHash}&sig=${encodeURIComponent(signature)}`


    // Conditionally create IP binding
    if (bindIp !== false) {
      // Optional IP placeholder or automatic binding later
      await createIpBinding(inviteHash, "0.0.0.0") // or handle binding later
      console.log(`[invite] ✅ Created IP binding for ${email}`)
    } else {
      console.log(`[invite] ⚠️ Skipped IP binding for ${email}`)
    }

    console.log(`[invite] ✅ New invite created for ${email}`)

    return NextResponse.json({
  success: true,
  invite: {
    email: invite.email,
    inviteHash: invite.invite_hash,
    signature: invite.signature,
    expiresAt: invite.expires_at,
    oneTimeUrl, // 👈 the link your QR code will use
  },
})
  } catch (err) {
    console.error("[invite] ❌ Error generating invite:", err)
    return NextResponse.json({ error: "Failed to generate invite" }, { status: 500 })
  }
}