import { type NextRequest, NextResponse } from "next/server"
import { verifySignature } from "@/lib/crypto"
import { getAdminKeyByPublicKey, createAuditLog } from "@/lib/db"
import { getAdminPublicKey } from "@/lib/env"

// Import challenges from challenge route
let challenges: Map<string, { nonce: string; expiresAt: number }>

// Workaround: use a module-level map
if (typeof globalThis !== "undefined") {
  if (!(globalThis as any).__adminChallenges) {
    ;(globalThis as any).__adminChallenges = new Map()
  }
  challenges = (globalThis as any).__adminChallenges
}

export async function POST(request: NextRequest) {
  try {
    const { challenge, signature, publicKey } = await request.json()

    if (!challenge || !signature || !publicKey) {
      return NextResponse.json({ error: "Challenge, signature, and public key are required" }, { status: 400 })
    }

    // Get client information
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() || request.headers.get("x-real-ip") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    // Verify challenge exists and is not expired
    const storedChallenge = challenges.get(challenge)

    if (!storedChallenge) {
      await createAuditLog("admin_auth_failed", null, null, ip, userAgent, {
        reason: "Challenge not found",
      })
      return NextResponse.json({ error: "Invalid or expired challenge" }, { status: 401 })
    }

    if (storedChallenge.expiresAt < Date.now()) {
      challenges.delete(challenge)
      await createAuditLog("admin_auth_failed", null, null, ip, userAgent, {
        reason: "Challenge expired",
      })
      return NextResponse.json({ error: "Challenge has expired" }, { status: 401 })
    }

    // Verify signature with provided public key
    const isValidSignature = verifySignature(challenge, signature, publicKey)

    if (!isValidSignature) {
      await createAuditLog("admin_auth_failed", null, null, ip, userAgent, {
        reason: "Invalid signature",
      })
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    // Check if public key is registered as admin
    const envAdminKey = getAdminPublicKey()
    const isEnvAdmin = publicKey === envAdminKey

    // Also check database for additional admin keys
    const dbAdminKey = await getAdminKeyByPublicKey(publicKey)

    if (!isEnvAdmin && !dbAdminKey) {
      await createAuditLog("admin_auth_failed", null, null, ip, userAgent, {
        reason: "Public key not authorized",
      })
      return NextResponse.json({ error: "Public key not authorized as admin" }, { status: 403 })
    }

    // Delete used challenge
    challenges.delete(challenge)

    // Create admin session
    await createAuditLog("admin_auth_success", null, null, ip, userAgent, {
      publicKey: publicKey.substring(0, 50) + "...",
    })

    console.log("[v0] Admin authenticated successfully")

    // Set admin session cookie
    const response = NextResponse.json({
      success: true,
      message: "Admin authenticated successfully",
    })

    response.cookies.set("admin_session", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 2, // 2 hours
      path: "/",
    })

    return response
  } catch (error) {
    console.error("[v0] Error verifying admin signature:", error)
    return NextResponse.json({ error: "Failed to verify admin signature" }, { status: 500 })
  }
}
