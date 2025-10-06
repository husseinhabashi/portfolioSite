/**
 * Script to sign admin challenge nonce
 * Run with: npm run setup:sign <challenge> [private-key-file]
 */

import { config } from "dotenv"
import { signData } from "../lib/crypto"
import { readFileSync } from "fs"

config({ path: ".env.local" })

const challenge = process.argv[2]
const keyFile = process.argv[3] || "admin-private-key.pem"

if (!challenge) {
  console.error("Usage: npm run setup:sign <challenge> [private-key-file]")
  process.exit(1)
}

try {
  const privateKey = readFileSync(keyFile, "utf-8")
  const signature = signData(challenge, privateKey)

  console.log("Challenge signed successfully!\n")
  console.log("Signature:")
  console.log(signature)
  console.log("\nCopy this signature to the admin authentication form.")
} catch (error) {
  console.error("Error signing challenge:", error)
  process.exit(1)
}
