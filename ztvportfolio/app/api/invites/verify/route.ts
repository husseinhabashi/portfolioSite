import { type NextRequest, NextResponse } from "next/server"
import { verifySignature } from "@/lib/crypto"
import { getInviteByHash, createAuditLog } from "@/lib/db"
import { getServerPublicKey } from "@/lib/env"

export async function POST(request: NextRequest) {
  try {
    const { inviteHash, signature } = await request.json()

    if (!inviteHash || !signature) {
      return NextResponse.json(
        { error: "Invite hash and signature are required" },
        { status: 400 }
      )
    }

    // Get client IP and user agent for audit logging
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    // Verify signature with server's public key
    const publicKey = getServerPublicKey()
    const isValidSignature = verifySignature(inviteHash, signature, publicKey)

    if (!isValidSignature) {
      await createAuditLog("signature_verification_failed", inviteHash, null, ip, userAgent, {
        inviteHash,
        reason: "Invalid signature",
      })
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    // Check if invite exists in database
    const invite = await getInviteByHash(inviteHash)

    if (!invite) {
      await createAuditLog("invite_not_found", inviteHash, null, ip, userAgent, { inviteHash })
      return NextResponse.json({ error: "Invite not found" }, { status: 404 })
    }

    // Check if invite is expired
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      await createAuditLog("invite_expired", invite.invite_hash, null, ip, userAgent, { inviteHash })
      return NextResponse.json({ error: "Invite has expired" }, { status: 401 })
    }

    // Check if invite is active
    if (!invite.is_active) {
      await createAuditLog("invite_inactive", invite.invite_hash, null, ip, userAgent, { inviteHash })
      return NextResponse.json({ error: "Invite is no longer active" }, { status: 401 })
    }

    // Log successful verification
    await createAuditLog("invite_verified", invite.invite_hash, null, ip, userAgent, { inviteHash })

    console.log("[v0] ✅ Invite verified successfully:", inviteHash)

    return NextResponse.json({
      success: true,
      invite: {
        email: invite.email,
        inviteHash: invite.invite_hash,
      },
    })
  } catch (error) {
    console.error("[v0] ❌ Error verifying invite:", error)
    return NextResponse.json({ error: "Failed to verify invite" }, { status: 500 })
  }
}