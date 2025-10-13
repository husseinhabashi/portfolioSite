// ✅ Force Node.js runtime — crypto requires it
export const runtime = "nodejs"

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSessionByFingerprint, getInviteByHash } from "@/lib/db"
import crypto from "crypto"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ──────────────────────────────────────────────
  // Public routes — skip verification
  // ──────────────────────────────────────────────
  const isPublic =
  pathname === "/" ||
  pathname.startsWith("/invite") ||               // public invite pages
  pathname.startsWith("/api/invites/") ||         // ✅ one-time invite tokens (plural)
  pathname.startsWith("/api/ip") ||
  pathname.startsWith("/api/track/pixel") ||
  pathname.startsWith("/api/session/create") ||
  pathname.startsWith("/api/admin/challenge") ||
  pathname.startsWith("/api/admin/verify") ||
  pathname.startsWith("/api/main")

  if (isPublic) {
    return NextResponse.next()
  }

  // ──────────────────────────────────────────────
  // Extract Zero-Trust headers
  // ──────────────────────────────────────────────
  const fingerprint = request.headers.get("x-session-fingerprint")
  const signature = request.headers.get("x-signature")

  if (!fingerprint || !signature) {
    console.warn(`[AUTH] Missing trust headers → redirecting to /invite`)
    return NextResponse.redirect(new URL("/invite", request.url))
  }

  // ──────────────────────────────────────────────
  // Validate session by fingerprint
  // ──────────────────────────────────────────────
  const session = await getSessionByFingerprint(fingerprint)
  if (!session) {
    console.warn(`[AUTH] Unknown fingerprint → redirecting`)
    return NextResponse.redirect(new URL("/invite", request.url))
  }

  // ──────────────────────────────────────────────
  // Verify signature using stored public key
  // ──────────────────────────────────────────────
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

  // ──────────────────────────────────────────────
  // Validate linked invite
  // ──────────────────────────────────────────────
  const invite = await getInviteByHash(session.invite_hash)
  if (!invite || !invite.is_active || !invite.used) {
    console.warn(`[AUTH] Inactive or expired invite → redirecting`)
    return NextResponse.redirect(new URL("/invite", request.url))
  }

  // ──────────────────────────────────────────────
  // Trust granted — inject security header
  // ──────────────────────────────────────────────
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-session-trust", "verified")

  return NextResponse.next({
    request: { headers: requestHeaders },
  })
}

// ──────────────────────────────────────────────
// Apply middleware only to protected user routes
// ──────────────────────────────────────────────
export const config = {
  matcher: [
    "/main",              // protected main area
    "/main/:path*",       // sub-routes
    "/api/secure/:path*", // secure APIs
    "/api/leaks/:path*",  // canary / telemetry
  ],
}