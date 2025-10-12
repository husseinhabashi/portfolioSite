import { NextResponse } from "next/server"
import { generateAdminChallenge } from "@/lib/crypto"
import { storeAdminChallenge } from "@/lib/db"

export async function GET() {
  try {
    const nonce = generateAdminChallenge()
    await storeAdminChallenge(nonce)

    console.log("Admin challenge generated:", nonce.substring(0, 16) + "...")
    return NextResponse.json({
      success: true,
      challenge: nonce,
      expiresAt: Date.now() + 5 * 60 * 1000,
    })
  } catch (err) {
    console.error("Error generating admin challenge:", err)
    return NextResponse.json({ error: "Failed to generate challenge" }, { status: 500 })
  }
}