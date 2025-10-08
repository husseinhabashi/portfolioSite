import { type NextRequest, NextResponse } from "next/server"
import { verifySignature } from "@/lib/crypto"
import { getInviteByHash, createAuditLog } from "@/lib/db"
import { getServerPublicKey } from "@/lib/env"

export async function POST(request: NextRequest) {
  try {
    const { inviteHash, signature } = await request.json()

    if (!inviteHash || !signature) {
      return NextResponse.json({ error: "Invite hash and signature are required" }, { status: 400 })
    }

    // ✅ Safe IP detection even on localhost
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1"
    const userAgent = request.headers.get("user-agent") || "unknown"

    const publicKey = getServerPublicKey()
    const isValidSignature = verifySignature(inviteHash, signature, publicKey)

    if (!isValidSignature) {
      await safeLog("signature_verification_failed", inviteHash, ip, userAgent, "Invalid signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const invite = await getInviteByHash(inviteHash)
    if (!invite) {
      await safeLog("invite_not_found", inviteHash, ip, userAgent)
      return NextResponse.json({ error: "Invite not found" }, { status: 404 })
    }

    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      await safeLog("invite_expired", invite.invite_hash, ip, userAgent)
      return NextResponse.json({ error: "Invite expired" }, { status: 401 })
    }

    if (!invite.is_active) {
      await safeLog("invite_inactive", invite.invite_hash, ip, userAgent)
      return NextResponse.json({ error: "Invite inactive" }, { status: 401 })
    }

    // ✅ Success — log and send redirect instruction
    await safeLog("invite_verified", invite.invite_hash, ip, userAgent)

    console.log("✅ Invite verified:", inviteHash)

    return NextResponse.json({
      success: true,
      redirect: "/main", // 👈 this tells the frontend where to go
      invite: {
        email: invite.email,
        inviteHash: invite.invite_hash,
      },
    })
  } catch (error) {
    console.error("❌ Verify invite error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function safeLog(event: string, hash: string, ip: string, ua: string, reason?: string) {
  try {
    await createAuditLog(event, hash, null, ip, ua, { inviteHash: hash, reason })
  } catch (e) {
    console.error("⚠️ Audit log failed:", e)
  }
}