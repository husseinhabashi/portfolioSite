import { NextResponse } from "next/server"
import { generateAdminChallenge } from "@/lib/crypto"

// Store challenges in memory (in production, use Redis or database)
const challenges = new Map<string, { nonce: string; expiresAt: number }>()

export async function GET() {
  try {
    // Generate challenge nonce
    const nonce = generateAdminChallenge()
    const expiresAt = Date.now() + 5 * 60 * 1000 // 5 minutes

    // Store challenge
    challenges.set(nonce, { nonce, expiresAt })

    // Clean up expired challenges
    for (const [key, value] of challenges.entries()) {
      if (value.expiresAt < Date.now()) {
        challenges.delete(key)
      }
    }

    console.log("[v0] Admin challenge generated:", nonce.substring(0, 16) + "...")

    return NextResponse.json({
      success: true,
      challenge: nonce,
      expiresAt,
    })
  } catch (error) {
    console.error("[v0] Error generating admin challenge:", error)
    return NextResponse.json({ error: "Failed to generate challenge" }, { status: 500 })
  }
}

// Export challenges map for verification
export { challenges }
