import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres" // or your pg client

export async function GET(req: Request) {
  try {
    // ✅ Get IP from headers
    const forwardedFor = req.headers.get("x-forwarded-for")
    const ip = forwardedFor?.split(",")[0]?.trim() || "Unknown"

    console.log("📡 Captured IP:", ip)

    // ✅ Insert into visitors table
    await sql`
      INSERT INTO visitors (ip_address, visited_at)
      VALUES (${ip}, NOW())
    `

    console.log("✅ IP logged immediately:", ip)

    return NextResponse.json({ success: true, ip })
  } catch (error) {
    console.error("❌ Failed to log IP:", error)
    return NextResponse.json(
      { success: false, error: "Failed to log IP" },
      { status: 500 }
    )
  }
}