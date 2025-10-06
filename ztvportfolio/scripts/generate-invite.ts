/**
 * Script to generate invite keys
 * Run with: npm run setup:invite <email>
 */
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { config } from "dotenv"
import { createInviteHash, generateNonce, signData } from "../lib/crypto"
import { getServerPrivateKey } from "../lib/env"
import { createInvite } from "../lib/db"

config({ path: ".env.local" })

async function main() {
  const email = process.argv[2]

  if (!email) {
    console.error("Usage: npm run setup:invite <email>")
    process.exit(1)
  }

  console.log(`Generating invite for: ${email}\n`)

  const timestamp = Date.now()
  const nonce = generateNonce()
  const inviteHash = createInviteHash(email, timestamp, nonce)

  const privateKey = getServerPrivateKey()
  const signature = signData(inviteHash, privateKey)

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now

  try {
    const invite = await createInvite(email, inviteHash, signature, expiresAt)
    console.log("✓ Invite created in database successfully!")
    console.log(`  ID: ${invite.id}`)
    console.log(`  Expires: ${expiresAt.toISOString()}\n`)
  } catch (error) {
    console.error("✗ Failed to create invite in database:", error)
    process.exit(1)
  }

  console.log("Invite Hash:")
  console.log(inviteHash)
  console.log("\nSignature:")
  console.log(signature)
  console.log("\n\nShare these credentials with the user:")
  console.log("━".repeat(60))
  console.log(`Email: ${email}`)
  console.log(`Invite Hash: ${inviteHash}`)
  console.log(`Signature: ${signature}`)
  console.log("━".repeat(60))
}

main().catch((error) => {
  console.error("Fatal error:", error)
  process.exit(1)
})