// lib/adminChallengeStore.ts
import fs from "fs"
import path from "path"

const storeFile = path.join(process.cwd(), ".admin-challenges.json")

// 🧠 Load challenges from disk if available
function readStore(): Map<string, { nonce: string; expiresAt: number }> {
  try {
    const data = fs.readFileSync(storeFile, "utf8")
    return new Map(Object.entries(JSON.parse(data)))
  } catch {
    return new Map()
  }
}

// 💾 Persist current map to disk
function writeStore(map: Map<string, { nonce: string; expiresAt: number }>) {
  const obj = Object.fromEntries(map)
  fs.writeFileSync(storeFile, JSON.stringify(obj, null, 2))
}

const adminChallenges = readStore()

// Add
export function setAdminChallenge(nonce: string) {
  adminChallenges.set(nonce, { nonce, expiresAt: Date.now() + 5 * 60 * 1000 })
  writeStore(adminChallenges)
}

// Get
export function getAdminChallenge(nonce: string) {
  return adminChallenges.get(nonce)
}

// Delete
export function deleteAdminChallenge(nonce: string) {
  adminChallenges.delete(nonce)
  writeStore(adminChallenges)
}

export { adminChallenges }