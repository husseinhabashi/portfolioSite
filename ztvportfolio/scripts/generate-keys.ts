/**
 * Script to generate ECDSA key pairs for server and admin
 * Run with: npm run setup:keys
 */

import { config } from "dotenv"
import { generateKeyPair } from "../lib/crypto"
import { writeFileSync, existsSync, readFileSync } from "fs"

config({ path: ".env.local" })

console.log("Generating cryptographic key pairs...\n")

// Generate server key pair
console.log("1. Server Key Pair (for signing invites):")
const serverKeys = generateKeyPair()
console.log("\nSERVER_PRIVATE_KEY:")
console.log(serverKeys.privateKey)
console.log("\nSERVER_PUBLIC_KEY:")
console.log(serverKeys.publicKey)

// Generate admin key pair
console.log("\n\n2. Admin Key Pair (for admin authentication):")
const adminKeys = generateKeyPair()
console.log("\nADMIN_PRIVATE_KEY (keep this secret!):")
console.log(adminKeys.privateKey)
console.log("\nADMIN_PUBLIC_KEY:")
console.log(adminKeys.publicKey)

let databaseUrl = "postgresql://postgres:postgres@localhost:5432/secure_portfolio"
if (existsSync(".env.local")) {
  const existingEnv = readFileSync(".env.local", "utf-8")
  const dbMatch = existingEnv.match(/DATABASE_URL=(.+)/)
  if (dbMatch) {
    databaseUrl = dbMatch[1]
  }
}

// Save to .env.local file
const envContent = `# Generated Cryptographic Keys
# Generated at: ${new Date().toISOString()}

DATABASE_URL=${databaseUrl}

SERVER_PRIVATE_KEY="${serverKeys.privateKey.replace(/\n/g, "\\n")}"
SERVER_PUBLIC_KEY="${serverKeys.publicKey.replace(/\n/g, "\\n")}"
ADMIN_PUBLIC_KEY="${adminKeys.publicKey.replace(/\n/g, "\\n")}"

INVITE_SECRET=${Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)}

NEXT_PUBLIC_APP_URL=http://localhost:3000
`

writeFileSync(".env.local", envContent)
console.log("\n\n✓ Keys saved to .env.local")
console.log("\n⚠️  IMPORTANT: Save your ADMIN_PRIVATE_KEY securely!")
console.log("You will need it to authenticate as admin.\n")

// Save admin private key separately
writeFileSync("admin-private-key.pem", adminKeys.privateKey)
console.log("✓ Admin private key saved to admin-private-key.pem")
console.log("  Add this file to .gitignore!\n")
