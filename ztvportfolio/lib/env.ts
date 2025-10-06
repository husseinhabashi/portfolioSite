export function getServerPrivateKey(): string {
  const key = process.env.SERVER_PRIVATE_KEY
  if (!key) {
    throw new Error("SERVER_PRIVATE_KEY environment variable is not set")
  }
  return key
}

export function getServerPublicKey(): string {
  const key = process.env.SERVER_PUBLIC_KEY
  if (!key) {
    throw new Error("SERVER_PUBLIC_KEY environment variable is not set")
  }
  return key
}

export function getAdminPublicKey(): string {
  const key = process.env.ADMIN_PUBLIC_KEY
  if (!key) {
    throw new Error("ADMIN_PUBLIC_KEY environment variable is not set")
  }
  return key
}

export function getInviteSecret(): string {
  const secret = process.env.INVITE_SECRET
  if (!secret) {
    throw new Error("INVITE_SECRET environment variable is not set")
  }
  return secret
}

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
}
