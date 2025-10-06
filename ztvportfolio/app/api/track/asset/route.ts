import { type NextRequest, NextResponse } from "next/server"
import { createLeakTrack } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { assetUrl, signature } = await request.json()

    if (!assetUrl || !signature) {
      return NextResponse.json({ error: "Asset URL and signature are required" }, { status: 400 })
    }

    // Get client information
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() || request.headers.get("x-real-ip") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    // Get session fingerprint from cookie
    const sessionFingerprint = request.cookies.get("session_fingerprint")?.value || "unknown"

    // Log the asset access
    await createLeakTrack(sessionFingerprint, assetUrl, signature, ip, userAgent)

    console.log("[v0] Asset tracked:", {
      assetUrl,
      signature: signature.substring(0, 16) + "...",
      ip,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error tracking asset:", error)
    return NextResponse.json({ error: "Failed to track asset" }, { status: 500 })
  }
}
