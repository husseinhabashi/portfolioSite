"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, ArrowLeft, Lock } from "lucide-react"

export default function InvitePage() {
  const [email, setEmail] = useState("")
  const [hash, setHash] = useState("")
  const [signature, setSignature] = useState("")
  const [status, setStatus] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleVerifyInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setStatus("")
    setLoading(true)

    try {
      const response = await fetch("/api/invites/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, hash, signature }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Verification failed")

      setStatus("✅ Invite verified! Redirecting...")
      setTimeout(() => (window.location.href = "/main"), 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ✅ Header identical to Admin pre-auth */}
     <header className="border-b border-green-800">
  <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
    {/* Back Button */}
    <Link href="/" className="w-full sm:w-auto">
      <Button
        variant="ghost"
        size="sm"
        className="gap-2 w-full sm:w-auto justify-center sm:justify-start text-green-400 hover:text-black hover:bg-green-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Button>
    </Link>

    {/* Title Section */}
    <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
      <Lock className="h-6 w-6 text-green-400 shrink-0" />
      <span className="font-bold text-lg sm:text-xl text-center sm:text-right">
        Invite Verification
      </span>
    </div>
  </div>
</header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Verify Your Invite</CardTitle>
            <CardDescription>
              Submit your invite hash and signature to access the portal
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleVerifyInvite} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hash">Invite Hash</Label>
                <Input
                  id="hash"
                  placeholder="Paste your invite hash"
                  value={hash}
                  onChange={(e) => setHash(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signature">Signature</Label>
                <Input
                  id="signature"
                  placeholder="Paste your digital signature"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {status && (
                <Alert>
                  <AlertDescription>{status}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Verifying..." : "Verify Invite"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}