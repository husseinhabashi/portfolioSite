import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ✅ Include session creation & main page as public for initial redirect
  const publicRoutes = [
    "/api/invites/verify",
    "/api/invites/generate",
    "/api/session/create",   // ✅ NEW
    "/invite",
    "/main",
    "/api/ip"              
  ]

  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // ✅ Check for session cookie for protected pages
  const sessionFingerprint = request.cookies.get("session_fingerprint")?.value

  if (!sessionFingerprint) {
    return NextResponse.redirect(new URL("/invite", request.url))
  }

  // ✅ Attach fingerprint to downstream requests
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-session-fingerprint", sessionFingerprint)

  return NextResponse.next({
    request: { headers: requestHeaders },
  })
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}