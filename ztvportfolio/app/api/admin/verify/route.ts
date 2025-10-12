import { NextResponse } from "next/server"
import crypto from "crypto"
import { getAdminChallenge, deleteAdminChallenge } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { challenge, signature, publicKey } = await req.json()

    if (!challenge || !signature || !publicKey)
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 })

    const entry = await getAdminChallenge(challenge)
    if (!entry || new Date(entry.expires_at) < new Date())
      return NextResponse.json({ error: "Challenge expired or invalid" }, { status: 401 })

    const verifier = crypto.createVerify("SHA256")
    verifier.update(challenge)
    verifier.end()

    const isValid = verifier.verify(publicKey, Buffer.from(signature, "base64"))

    if (!isValid)
      return NextResponse.json({ error: "Invalid signature" }, { status: 402 })

    await deleteAdminChallenge(challenge)
    console.log("[verify] Admin verified successfully")
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Error verifying admin signature:", err)
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}