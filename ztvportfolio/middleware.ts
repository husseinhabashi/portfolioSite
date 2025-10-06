import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ["/api/invites/verify", "/api/invites/generate", "/invite"]

  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Check for session cookie
  const sessionFingerprint = request.cookies.get("session_fingerprint")?.value

  if (!sessionFingerprint) {
    // Redirect to invite page if no session
    return NextResponse.redirect(new URL("/invite", request.url))
  }

  // Add session fingerprint to headers for API routes to access
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
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
