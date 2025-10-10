import { type NextRequest, NextResponse } from "next/server"
import { createAuditLog } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { eventType, fingerprint, timestamp } = await request.json()

    if (!eventType || !fingerprint) {
      return NextResponse.json({ error: "Event type and fingerprint are required" }, { status: 400 })
    }

    // Get client information
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() || request.headers.get("x-real-ip") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    // Log the security event
    await createAuditLog(eventType, null, fingerprint, ip, userAgent, {
      timestamp,
      clientDetected: true,
    })

    console.log("Security event logged:", eventType, "from", ip)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error logging security event:", error)
    return NextResponse.json({ error: "Failed to log security event" }, { status: 500 })
  }
}
