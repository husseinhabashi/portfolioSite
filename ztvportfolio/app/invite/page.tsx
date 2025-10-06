"use client"

import type React from "react"

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
      // Verify invite with server
      const verifyResponse = await fetch("/api/invites/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteHash, signature }),
      })

      if (!verifyResponse.ok) {
        const data = await verifyResponse.json()
        throw new Error(data.error || "Verification failed")
      }

      // Create session
      const sessionResponse = await fetch("/api/session/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteHash, signature }),
      })

      if (!sessionResponse.ok) {
        const data = await sessionResponse.json()
        throw new Error(data.error || "Session creation failed")
      }

      // Redirect to home page
      router.push("/")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Secure Access Portal</CardTitle>
          <CardDescription>Enter your cryptographically signed invite credentials</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inviteHash" className="flex items-center gap-2">
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
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signature" className="flex items-center gap-2">
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
                className="font-mono text-sm"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Verifying..." : "Verify & Enter"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>This portal uses cryptographic verification.</p>
            <p className="mt-1">Access requires a valid signed invite key.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
