// ⚙️ Force Node.js runtime — crypto required for trust verification
export const runtime = "nodejs"

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSessionByFingerprint, getInviteByHash } from "@/lib/db"
import crypto from "crypto"
import { getServerPublicKey } from "@/lib/env"

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // 🟢 Public endpoints (skip Zero-Trust enforcement)
  const isPublic =
    pathname === "/" ||
    pathname.startsWith("/invite") ||
    pathname.startsWith("/api/invites/") ||
    pathname.startsWith("/api/ip") ||
    pathname.startsWith("/api/track/pixel") ||
    pathname.startsWith("/api/session/create") ||
    pathname.startsWith("/api/admin/challenge") ||
    pathname.startsWith("/api/admin/verify") ||
    pathname.startsWith("/api/main") 

  if (isPublic) return NextResponse.next()

  // 🔍 Extract Zero-Trust credentials (headers → cookies → query)
  const fingerprint =
    request.headers.get("x-session-fingerprint") ||
    request.cookies.get("zt_fingerprint")?.value ||
    searchParams.get("f") ||
    null

  const signature =
    request.headers.get("x-signature") ||
    request.cookies.get("zt_signature")?.value ||
    searchParams.get("s") ||
    null

  // 🚫 Missing trust values → block immediately
  if (!fingerprint || !signature) {
    console.warn(`[AUTH] Missing Zero-Trust headers → redirecting`)
    return NextResponse.redirect(new URL("/invite", request.url))
  }

  // 🧩 Lookup existing session
  const session = await getSessionByFingerprint(fingerprint)
  if (!session) {
    console.warn(`[AUTH] No active session for fingerprint → redirecting`)
    return NextResponse.redirect(new URL("/invite", request.url))
  }

  // 🔏 Validate signature
  let isValid = false
  try {
    const publicKey = getServerPublicKey()
    const verifier = crypto.createVerify("SHA256")
    verifier.update(fingerprint)
    verifier.end()
    isValid = verifier.verify(publicKey, Buffer.from(signature, "base64"))
  } catch (err) {
    console.warn(`[AUTH] Signature verification failed: ${err}`)
  }

  if (!isValid) {
    console.warn(`[AUTH] Invalid signature → redirecting`)
    return NextResponse.redirect(new URL("/invite", request.url))
  }

  // 🧠 Validate linked invite
  const invite = await getInviteByHash(session.invite_hash)
  if (!invite || !invite.is_active || !invite.used) {
    console.warn(`[AUTH] Invite inactive or expired → redirecting`)
    return NextResponse.redirect(new URL("/invite", request.url))
  }

  // ✅ Zero-Trust chain validated — inject ephemeral verification header
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-session-trust", "verified")

  return NextResponse.next({
    request: { headers: requestHeaders },
  })
}

// 🔒 Enforce Zero-Trust on protected areas only
export const config = {
  matcher: [
    "/main",
    "/main/:path*",       
    "/api/secure/:path*",
    "/api/leaks/:path*",
  ],
}