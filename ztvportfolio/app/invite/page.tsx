"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, ArrowLeft, Lock } from "lucide-react"

export default function InvitePage() {
  const [email, setEmail] = useState("")
  const [inviteHash, setInviteHash] = useState("")
  const [signature, setSignature] = useState("")
  const [fingerprint, setFingerprint] = useState("")
  const [status, setStatus] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // 🔐 Generate reproducible Zero-Trust fingerprint
  useEffect(() => {
    const generateFingerprint = async () => {
      const userAgent = navigator.userAgent
      const language = navigator.language
      const screenRes = `${window.screen.width}x${window.screen.height}`
      const entropy = `${userAgent}|${language}|${screenRes}|${Date.now()}`
      const data = new TextEncoder().encode(entropy)
      const hashBuffer = await crypto.subtle.digest("SHA-256", data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("")
      setFingerprint(hashHex)
    }
    generateFingerprint()
  }, [])

  // 🧠 Handle Invite Verification
  const handleVerifyInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setStatus("")
    setLoading(true)

    try {
      // 1️⃣ Verify invite with Zero Trust signature
      const verifyRes = await fetch("/api/invites/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, inviteHash, signature, fingerprint }),
      })

      const verifyData = await verifyRes.json()
      if (!verifyRes.ok) throw new Error(verifyData.error || "Verification failed")

      // 2️⃣ Create a secure session on the backend
      const createSessionRes = await fetch("/api/session/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inviteHash,
          fingerprint,
          signature: verifyData.signedSession, // use server-signed signature
        }),
      })

      const createSessionData = await createSessionRes.json()
      if (!createSessionRes.ok) throw new Error(createSessionData.error || "Session creation failed")

      // 3️⃣ Persist trust values locally (client-side session)
      sessionStorage.setItem("session_fingerprint", createSessionData.sessionFingerprint)
      sessionStorage.setItem("session_signature", verifyData.signedSession)
      localStorage.setItem("headers:x-session-fingerprint", createSessionData.sessionFingerprint)
      localStorage.setItem("headers:x-signature", verifyData.signedSession)

      console.log("✅ Zero Trust session established:", {
        fingerprint: createSessionData.sessionFingerprint,
        signature: verifyData.signedSession || signature,
      })

      // 4️⃣ Redirect
      setStatus("Invite verified! Redirecting securely...")
      setTimeout(() => (window.location.href = "/main"), 1000)
    } catch (err) {
      console.error("❌ Verification error:", err)
      setError(err instanceof Error ? err.message : "Verification failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* 🔒 Header */}
      <header className="border-b border-green-800">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
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

          <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
            <Lock className="h-6 w-6 text-green-400 shrink-0" />
            <span className="font-bold text-lg sm:text-xl text-center sm:text-right">
              Invite Verification
            </span>
          </div>
        </div>
      </header>

      {/* 🧾 Verification Card */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-md border border-green-800/50">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-green-500/10 rounded-full">
                <Shield className="h-8 w-8 text-green-400" />
              </div>
            </div>
            <CardTitle className="text-2xl text-green-400">Verify Your Invite</CardTitle>
            <CardDescription className="text-green-300/70">
              Submit your invite hash and signature to access the vault
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
                <Label htmlFor="inviteHash">Invite Hash</Label>
                <Input
                  id="inviteHash"
                  placeholder="Paste your invite hash"
                  value={inviteHash}
                  onChange={(e) => setInviteHash(e.target.value)}
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

              {/* Feedback */}
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

              <Button
                type="submit"
                className="w-full bg-green-500 text-black hover:bg-green-400"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify Invite"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}