"use client"

import { useState } from "react"
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // ✅ Verify invite on backend
      const res = await fetch("/api/invites/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteHash, signature }),
      })

      const text = await res.text()
      console.log("📡 RAW RESPONSE:", text)

      let data
      try {
        data = JSON.parse(text)
      } catch {
        throw new Error("Server returned non-JSON response")
      }
      console.log("📡 Verification response:", data)

      if (!res.ok) throw new Error(data.error || "Verification failed")

      // ✅ Redirect based on backend response
      const redirectPath = data.redirect || "/main"
      console.log("✅ Redirecting to:", redirectPath)
      router.push(redirectPath)

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