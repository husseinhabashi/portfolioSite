import { type NextRequest, NextResponse } from "next/server"
import { createLeakTrack } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const signature = searchParams.get("sig")

    if (!signature) {
      return new NextResponse(null, { status: 400 })
    }

    // Get client information
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() || request.headers.get("x-real-ip") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"
    const referer = request.headers.get("referer") || "unknown"

    // Get session fingerprint from cookie
    const sessionFingerprint = request.cookies.get("session_fingerprint")?.value || "unknown"

    // Log the tracking pixel access
    await createLeakTrack(sessionFingerprint, referer, signature, ip, userAgent)

    console.log("[v0] Tracking pixel accessed:", {
      signature: signature.substring(0, 16) + "...",
      ip,
      referer,
    })

    // Return 1x1 transparent GIF
    const gif = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64")

    return new NextResponse(gif, {
      status: 200,
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    })
  } catch (error) {
    console.error("[v0] Error in tracking pixel:", error)
    return new NextResponse(null, { status: 500 })
  }
}
