import { verifySignature } from "@/lib/crypto"
import { getSessionByFingerprint, getInviteByHash, updateSessionLastSeen } from "@/lib/db"
import { getServerPublicKey } from "@/lib/env"

export async function verifyZeroTrust(request: Request) {
  try {
    const fingerprint = request.headers.get("x-session-fingerprint")
    const signature = request.headers.get("x-signature")

    if (!fingerprint || !signature) {
      return { valid: false, error: "Missing authentication headers" }
    }

    // 🔍 Get session
    const session = await getSessionByFingerprint(fingerprint)
    if (!session) {
      return { valid: false, error: "Session not found" }
    }

    // 🔏 Verify signature
    const publicKey = getServerPublicKey()
    const isValid = verifySignature(fingerprint, signature, publicKey)
    if (!isValid) {
      return { valid: false, error: "Invalid signature" }
    }

    // 🧾 Verify invite still valid
    const invite = await getInviteByHash(session.invite_hash)
    if (!invite || !invite.is_active || !invite.used) {
      return { valid: false, error: "Invite inactive or expired" }
    }

    // 🕒 Update last seen for active session tracking
    await updateSessionLastSeen(fingerprint)

    return { valid: true, session, fingerprint }
  } catch (err) {
    console.error("[ZeroTrust] verification error:", err)
    return { valid: false, error: "Internal verification error" }
  }
}