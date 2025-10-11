import { type NextRequest, NextResponse } from "next/server"
import { verifyZeroTrust } from "@/lib/zeroTrust" // centralized verifier

export async function GET(request: NextRequest) {
  try {
    // 🔐 Run Zero Trust verification
    const trust = await verifyZeroTrust(request)

    if (!trust.valid) {
      console.warn("[AUTH] Zero Trust verification failed:", trust.error)
      return NextResponse.json({ error: trust.error }, { status: 401 })
    }

    // ✅ Access granted
    return NextResponse.json({
      success: true,
      message: "Access granted to /main",
      fingerprint: trust.fingerprint,
      sessionId: trust.session.session_id,
    })
  } catch (error) {
    console.error("❌ /api/main error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}