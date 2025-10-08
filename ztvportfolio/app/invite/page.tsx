"use client"

import { useState, useEffect } from "react"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Lock, Key } from "lucide-react"

export default function InvitePage() {
  const router = useRouter()
  const [inviteHash, setInviteHash] = useState("")
  const [signature, setSignature] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

   useEffect(() => {
    Cookies.remove("session_fingerprint")
    console.log("🧹 Session fingerprint cleared on invite page load")
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError("")
  setLoading(true)

  try {
    // 1️⃣ Verify invite
    const verifyRes = await fetch("/api/invites/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteHash, signature }),
    })

    const verifyData = await verifyRes.json()
    if (!verifyRes.ok) throw new Error(verifyData.error || "Verification failed")

    console.log("✅ Invite verified, now creating session...")

    // 2️⃣ Create session BEFORE redirect
    const sessionRes = await fetch("/api/session/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteHash, signature }),
    })

    const sessionData = await sessionRes.json()
    if (!sessionRes.ok) throw new Error(sessionData.error || "Session creation failed")

    console.log("✅ Session created, redirecting to:", sessionData.redirect)

    // 3️⃣ Redirect to main
    router.push(sessionData.redirect || "/main")

  } catch (err) {
    console.error("❌ Verification error:", err)
    setError(err instanceof Error ? err.message : "An unknown error occurred")
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-green-400 font-mono p-4">
      <Card className="w-full max-w-md border-green-700 bg-black text-green-400">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-green-900/20 rounded-full border border-green-700">
              <Shield className="h-8 w-8 text-green-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Secure Access Portal</CardTitle>
          <CardDescription className="text-green-500">
            Enter your cryptographically signed invite credentials
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Invite Hash Field */}
            <div className="space-y-2">
              <Label htmlFor="inviteHash" className="flex items-center gap-2 text-green-400">
                <Key className="h-4 w-4" />
                Invite Hash
              </Label>
              <Input
                id="inviteHash"
                type="text"
                placeholder="SHA-256 invite hash"
                value={inviteHash}
                onChange={(e) => setInviteHash(e.target.value)}
                required
                className="font-mono text-sm border-green-700 bg-black text-green-400 placeholder-green-600 focus:border-green-400 focus:ring-green-400"
              />
            </div>

            {/* Signature Field */}
            <div className="space-y-2">
              <Label htmlFor="signature" className="flex items-center gap-2 text-green-400">
                <Lock className="h-4 w-4" />
                Digital Signature
              </Label>
              <Input
                id="signature"
                type="text"
                placeholder="ECDSA signature"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                required
                className="font-mono text-sm border-green-700 bg-black text-green-400 placeholder-green-600 focus:border-green-400 focus:ring-green-400"
              />
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="border-red-700 bg-red-900/20 text-red-400">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-green-500 text-black hover:bg-green-400 transition"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify & Enter"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-green-500">
            <p>This portal uses cryptographic verification.</p>
            <p className="mt-1">Access requires a valid signed invite key.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}