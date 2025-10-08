import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSessionByFingerprint, getInviteByHash } from "@/lib/db"
export async function middleware(request: NextRequest) {
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
  
  const sessionFingerprint = request.cookies.get("session_fingerprint")?.value
  if (!sessionFingerprint) {
    return NextResponse.redirect(new URL("/invite", request.url))
  }

  // 🔐 Validate session from DB
  const session = await getSessionByFingerprint(sessionFingerprint)
  if (!session) {
    console.warn("⚠️ Invalid or expired session — redirecting.")
    return NextResponse.redirect(new URL("/invite", request.url))
  }

  // 🔎 Optional: validate the invite behind this session is still valid
  const invite = await getInviteByHash(session.invite_hash)
  if (!invite || !invite.is_active || !invite.used) {
    console.warn("⚠️ Invite no longer valid — redirecting.")
    return NextResponse.redirect(new URL("/invite", request.url))
  }

  // ✅ Pass fingerprint forward
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-session-fingerprint", sessionFingerprint)

  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}