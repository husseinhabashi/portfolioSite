// ✅ Force Node.js runtime — Edge Runtime breaks crypto operations
export const runtime = "nodejs"

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSessionByFingerprint, getInviteByHash } from "@/lib/db"
import crypto from "crypto"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ──────────────────────────────────────────────
  // Public Routes — skip verification
  // These should *not* be behind Zero Trust headers
  // Includes all /invite and related API routes
  // ──────────────────────────────────────────────
  const isPublic =
    pathname === "/" ||
    pathname.startsWith("/invite") || // ✅ covers /invite, /invite/, /invite/[token]
    pathname.startsWith("/api/ip") ||
    pathname.startsWith("/api/track/pixel") ||
    pathname.startsWith("/api/invites/") ||
    pathname.startsWith("/api/session/create") ||
    pathname.startsWith("/api/admin/challenge") ||
    pathname.startsWith("/api/admin/verify") ||
    pathname.startsWith("/api/main")

  if (isPublic) {
    return NextResponse.next()
  }

  // ──────────────────────────────────────────────
  // Extract Zero-Trust Headers
  // ──────────────────────────────────────────────
  const fingerprint = request.headers.get("x-session-fingerprint")
  const signature = request.headers.get("x-signature")

  if (!fingerprint || !signature) {
    console.warn(`[AUTH] Missing trust headers → redirecting to /invite`)
    return NextResponse.redirect(new URL("/invite", request.url))
  }

  // ──────────────────────────────────────────────
  // Validate Session by Fingerprint
  // ──────────────────────────────────────────────
  const session = await getSessionByFingerprint(fingerprint)
  if (!session) {
    console.warn(`[AUTH] Unknown fingerprint → redirecting`)
    return NextResponse.redirect(new URL("/invite", request.url))
  }

  // ──────────────────────────────────────────────
  // Verify Signature using Stored Public Key
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
  // Validate Linked Invite
  // ──────────────────────────────────────────────
  const invite = await getInviteByHash(session.invite_hash)
  if (!invite || !invite.is_active || !invite.used) {
    console.warn(`[AUTH] Inactive or expired invite → redirecting`)
    return NextResponse.redirect(new URL("/invite", request.url))
  }

  // ──────────────────────────────────────────────
  // Trust Granted — Inject Security Header
  // ──────────────────────────────────────────────
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-session-trust", "verified")

  return NextResponse.next({
    request: { headers: requestHeaders },
  })
}

// ──────────────────────────────────────────────
// Apply Middleware Only to Protected Routes
// ──────────────────────────────────────────────
export const config = {
  matcher: [
    "/main",                // Protected dashboard root
    "/main/:path*",         // Sub-routes under /main
    "/api/secure/:path*",   // Secure APIs
    "/api/admin/invite",    // Admin-only invite ops
    "/api/admin/ipbinding", // Admin-only IP binding ops
  ],
}