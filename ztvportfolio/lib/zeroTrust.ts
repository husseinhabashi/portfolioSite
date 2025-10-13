import { verifySignature } from "@/lib/crypto"
import { getSessionByFingerprint, getInviteByHash, updateSessionLastSeen } from "@/lib/db"
import { getServerPublicKey } from "@/lib/env"

export async function verifyZeroTrust(request: Request | any) {
  try {
    // Extract trust from either headers OR query params (SSR-friendly)
    const url = new URL(request.url)
    const fingerprint =
      request.headers.get("x-session-fingerprint") ||
      url.searchParams.get("f") ||
      null

    const signature =
      request.headers.get("x-signature") ||
      url.searchParams.get("s") ||
      null

    if (!fingerprint || !signature) {
      return { valid: false, error: "Missing authentication headers" }
    }

    // 🔍 Check for session
    const session = await getSessionByFingerprint(fingerprint)
    if (!session) return { valid: false, error: "Session not found" }

    // 🔏 Validate signature
    const publicKey = getServerPublicKey()
    const isValid = verifySignature(fingerprint, signature, publicKey)
    if (!isValid) return { valid: false, error: "Invalid signature" }

    // 🧾 Check invite status
    const invite = await getInviteByHash(session.invite_hash)
    if (!invite || !invite.used) {
      return { valid: false, error: "Invite inactive or expired" }
    }

    // 🕒 Touch last_seen for active telemetry
    await updateSessionLastSeen(fingerprint)

    return { valid: true, session, fingerprint }
  } catch (err) {
    console.error("[ZeroTrust] verification error:", err)
    return { valid: false, error: "Internal verification error" }
  }
}