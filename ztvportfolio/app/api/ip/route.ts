import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";

// Force Node runtime (Neon serverless driver is not Edge-compatible)
export const runtime = "nodejs";

export async function GET(request: Request) {
  // Grab the first IP from x-forwarded-for, or fall back
  const fwd = request.headers.get("x-forwarded-for") || "";
  const ip = fwd.split(",")[0]?.trim() || "127.0.0.1";

  try {
    const sql = getSql(); // <- from your lib/db.ts (uses DATABASE_URL)
    await sql`
      INSERT INTO visitors (ip_address, visited_at)
      VALUES (${ip}, NOW())
    `;

    console.log("✅ IP logged immediately:", ip);
    return NextResponse.json({ success: true, ip });
  } catch (error: any) {
    console.error("❌ Failed to log IP:", error);
    return NextResponse.json(
      { success: false, error: error?.message ?? "Failed to log IP" },
      { status: 500 }
    );
  }
}