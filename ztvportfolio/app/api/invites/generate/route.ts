import { type NextRequest, NextResponse } from "next/server"
import { createInviteHash, generateNonce, signData } from "@/lib/crypto"
import { createInvite } from "@/lib/db"
import { getServerPrivateKey } from "@/lib/env"

export async function POST(request: NextRequest) {
  try {
    const { email, expiresInDays } = await request.json()

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
    }

    // Generate invite hash with timestamp and nonce
    const timestamp = Date.now()
    const nonce = generateNonce()
    const inviteHash = createInviteHash(email, timestamp, nonce)

    // Sign the invite hash with server's private key
    const privateKey = getServerPrivateKey()
    const signature = signData(inviteHash, privateKey)

    // Calculate expiration date
    const expiresAt = expiresInDays ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000) : undefined

    // Store invite in database
    const invite = await createInvite(email, inviteHash, signature, expiresAt)

    console.log("[v0] Generated invite for:", email, "hash:", inviteHash)

    return NextResponse.json({
      success: true,
      invite: {
        email: invite.email,
        inviteHash: invite.invite_hash,
        signature: invite.signature,
        expiresAt: invite.expires_at,
      },
    })
  } catch (error) {
    console.error("[v0] Error generating invite:", error)
    return NextResponse.json({ error: "Failed to generate invite" }, { status: 500 })
  }
}
