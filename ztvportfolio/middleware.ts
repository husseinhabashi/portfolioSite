// Force Node.js runtime — crypto won't work in the Edge runtime
export const runtime = "nodejs"

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSessionByFingerprint, getInviteByHash } from "@/lib/db"
import crypto from "crypto"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 🟢 Public routes that skip verification
  const publicRoutes = [
  "/", 
  "/invite", 
  "/invite/",       
  "/invite/token",
  "/api/ip", 
  "/api/track/pixel",
  "/api/invites/verify", 
  "/api/invites/generate",
  "/api/session/create", 
  "/api/admin/challenge", 
  "/api/admin/verify",
  "/api/main",
]

  // Let public routes through
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // 🔍 Extract trust headers
  const fingerprint = request.headers.get("x-session-fingerprint")
  const signature = request.headers.get("x-signature")

  // 🚫 Missing headers → force re-auth
  if (!fingerprint || !signature) {
    console.warn(`[AUTH] Missing trust headers → redirecting to /invite`)
    return NextResponse.redirect(new URL("/invite", request.url))
  }

  // 🧩 Lookup session via fingerprint
  const session = await getSessionByFingerprint(fingerprint)
  if (!session) {
    console.warn(`[AUTH] Unknown fingerprint → redirecting`)
    return NextResponse.redirect(new URL("/invite", request.url))
  }

  // 🔏 Verify ECDSA signature
  let isValid = false
  try {
    const verifier = crypto.createVerify("SHA256")
    verifier.update(fingerprint)
    verifier.end()
    isValid = verifier.verify(session.public_key, Buffer.from(signature, "base64"))
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
    console.warn(`[AUTH] Inactive or expired invite → redirecting`)
    return NextResponse.redirect(new URL("/invite", request.url))
  }

  // 🟩 All checks passed — inject Zero-Trust header
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-session-trust", "verified")

  return NextResponse.next({
    request: { headers: requestHeaders },
  })
}

// 🔒 Apply middleware only to sensitive areas
export const config = {
  matcher: [
    "/main",            // root protected page
    "/main/:path*",     // sub-routes under /main
    "/api/secure/:path*", // optional secured APIs
    "/api/admin/invite",
    "/api/admin/ipbinding",  // secured admin endpoint
  ],
}