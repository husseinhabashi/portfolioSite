import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSessionByFingerprint, getInviteByHash } from "@/lib/db"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ✅ True public routes (safe before login)
  const publicRoutes = [
    "/", // landing page
    "/invite", // invite or login flow
    "/api/ip", // IP logger
    "/api/track/pixel", // tracking pixel
    "/api/invites/verify",
    "/api/invites/generate",
    "/api/session/create",
    "/api/admin/challenge",
    "/api/admin/verify",
  ]

  // Skip auth checks on public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // 🔍 Grab cookie
  const sessionFingerprint = request.cookies.get("session_fingerprint")?.value
  if (!sessionFingerprint) {
    console.warn(`[AUTH] No session fingerprint → redirecting from ${pathname}`)
    return NextResponse.redirect(new URL("/invite", request.url))
  }

  // 🔐 Validate session
  const session = await getSessionByFingerprint(sessionFingerprint)
  if (!session) {
    console.warn(`[AUTH] Invalid session → redirecting from ${pathname}`)
    return NextResponse.redirect(new URL("/invite", request.url))
  }

  // 🔎 Validate invite link tied to session
  const invite = await getInviteByHash(session.invite_hash)
  if (!invite || !invite.is_active || !invite.used) {
    console.warn(`[AUTH] Expired or inactive invite → redirecting from ${pathname}`)
    return NextResponse.redirect(new URL("/invite", request.url))
  }

  // ✅ Forward valid fingerprint to protected API routes
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-session-fingerprint", sessionFingerprint)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    // Apply middleware to everything except static files
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}