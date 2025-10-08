import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres" // or your pg client

export async function GET(req: Request) {
  try {
    // ✅ Try multiple headers for better real IP detection (important for Vercel/Proxies)
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1" // fallback for localhost

    console.log("📡 Captured visitor IP:", ip)

    // ✅ Log IP to Neon DB (make sure `visitors` table exists with ip_address + visited_at)
    await sql`
      INSERT INTO visitors (ip_address, visited_at)
      VALUES (${ip}, NOW())
    `

    console.log("✅ IP logged immediately:", ip)

    // ✅ Respond with IP
    return NextResponse.json({ success: true, ip })
  } catch (error) {
    console.error("❌ Failed to log IP:", error)
    return NextResponse.json(
      { success: false, error: "Failed to log IP" },
      { status: 500 }
    )
  }
}