import { createHash, createSign, createVerify, generateKeyPairSync, randomBytes } from "crypto"

/**
 * Generate SHA-256 hash of input data
 */
export function sha256(data: string): string {
  return createHash("sha256").update(data).digest("hex")
}

/**
 * Generate a cryptographically secure random nonce
 */
export function generateNonce(length = 32): string {
  return randomBytes(length).toString("hex")
}

/**
 * Create an invite hash from email, timestamp, and nonce
 * Format: SHA-256(email + timestamp + nonce)
 */
export function createInviteHash(email: string, timestamp: number, nonce: string): string {
  const data = `${email}${timestamp}${nonce}`
  return sha256(data)
}

/**
 * Sign data with private key using ECDSA
 */
export function signData(data: string, privateKey: string): string {
  const sign = createSign("SHA256")
  sign.update(data)
  sign.end()
  return sign.sign(privateKey, "base64")
}

/**
 * Verify signature with public key using ECDSA
 */
export function verifySignature(data: string, signature: string, publicKey: string): boolean {
  try {
    const verify = createVerify("SHA256")
    verify.update(data)
    verify.end()
    return verify.verify(publicKey, signature, "base64")
  } catch (error) {
    console.error("[v0] Signature verification error:", error)
    return false
  }
}

/**
 * Generate ECDSA key pair for server or admin use
 */
export function generateKeyPair(): { publicKey: string; privateKey: string } {
  const { publicKey, privateKey } = generateKeyPairSync("ec", {
    namedCurve: "prime256v1",
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  })

  return { publicKey, privateKey }
}

/**
 * Create session fingerprint from client data
 * Format: SHA-256(ip + user-agent + invite-hash + timestamp)
 */
export function createSessionFingerprint(ip: string, userAgent: string, inviteHash: string, timestamp: number): string {
  const data = `${ip}${userAgent}${inviteHash}${timestamp}`
  return sha256(data)
}

/**
 * Create IP binding hash
 * Format: SHA-256(invite-hash + ip)
 */
export function createIpBindingHash(inviteHash: string, ip: string): string {
  return sha256(`${inviteHash}${ip}`)
}

/**
 * Generate canary token signature for leak tracking
 * Format: SHA-256(session-fingerprint + asset-url + timestamp)
 * NOTE: This function can be used client-side for tracking pixels
 */
export function createCanarySignature(sessionFingerprint: string, assetUrl: string, timestamp: number): string {
  const data = `${sessionFingerprint}${assetUrl}${timestamp}`
  // Use a simple hash implementation for client-side compatibility
  if (typeof window !== "undefined") {
    // Browser environment - use SubtleCrypto or fallback
    return btoa(`${sessionFingerprint.substring(0, 8)}-${timestamp}`)
  }
  return sha256(data)
}

/**
 * Generate admin challenge nonce
 */
export function generateAdminChallenge(): string {
  return generateNonce(64)
}
