"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, ArrowLeft, Lock, Copy } from "lucide-react"

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
      const ua = navigator.userAgent
      const lang = navigator.language
      const res = `${window.screen.width}x${window.screen.height}`
      const entropy = `${ua}|${lang}|${res}`
      const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(entropy))
      const hex = Array.from(new Uint8Array(hash))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
      setFingerprint(hex)
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
      const verifyRes = await fetch("/api/invites/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, inviteHash, signature, fingerprint }),
      })
      const verifyData = await verifyRes.json()
      if (!verifyRes.ok) throw new Error(verifyData.error || "Verification failed")

      const createSessionRes = await fetch("/api/session/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inviteHash,
          fingerprint,
          signature: verifyData.signedSession,
        }),
      })
      const createSessionData = await createSessionRes.json()
      if (!createSessionRes.ok)
        throw new Error(createSessionData.error || "Session creation failed")

      const sessionFingerprint =
        createSessionData.sessionFingerprint || createSessionData.sessionId || fingerprint
      const sessionSignature = verifyData.signedSession || signature

      sessionStorage.setItem("session_fingerprint", sessionFingerprint)
      sessionStorage.setItem("session_signature", sessionSignature)
      localStorage.setItem("headers:x-session-fingerprint", sessionFingerprint)
      localStorage.setItem("headers:x-signature", sessionSignature)

      console.log("✅ Zero-Trust session established:", {
        fingerprint: sessionFingerprint,
        signature: sessionSignature,
      })

      setStatus("Invite verified! Redirecting securely...")
      setTimeout(async () => {
        const f = sessionStorage.getItem("session_fingerprint")
        const s = sessionStorage.getItem("session_signature")

        if (f && s) {
          await fetch("/api/session/verify", {
            headers: { "x-session-fingerprint": f, "x-signature": s },
          })
          const url = new URL("/main", window.location.origin)
          url.searchParams.set("f", f)
          url.searchParams.set("s", s)
          window.location.href = url.toString()
        } else {
          window.location.href = "/invite"
        }
      }, 1000)
    } catch (err) {
      console.error("❌ Verification error:", err)
      setError(err instanceof Error ? err.message : "Verification failed")
    } finally {
      setLoading(false)
    }
  }

  // 📋 Copy function
  const handleCopy = async (value: string) => {
    await navigator.clipboard.writeText(value)
    setStatus(`Copied: ${value.substring(0, 10)}...`)
    setTimeout(() => setStatus(""), 1500)
  }

  // Static universal invite data
  const universal = {
    email: "universal@auth",
    inviteHash: "f04d17111337617e96470cfa762885854e55d9b3a2f31ddb935d57c50118e403",
    signature:
      "MEUCIHq+6M93ZaehLhq7Z3YfL5E/la8W7qGlSCexR4tpMeUnAiEAubQnSNeT8EHDFbFxuthoxky/BEPD3SgbTZE37IqNrpU=",
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

      {/* 📄 Universal Invite Info */}
      <div className="container mx-auto px-4 mt-6 mb-2">
        <Card className="border border-green-800/60 bg-black/70 text-green-400">
          <CardHeader>
            <CardTitle className="text-green-400 text-lg">Universal Access Credentials</CardTitle>
            <CardDescription className="text-green-300/80">
              Use these for instant access across devices
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Email:</span>
              <div className="flex items-center gap-2">
                <code className="text-xs sm:text-sm">{universal.email}</code>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCopy(universal.email)}
                  className="text-green-400 hover:text-black hover:bg-green-400"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-semibold">Invite Hash:</span>
              <div className="flex items-center gap-2">
                <code className="text-xs sm:text-sm truncate max-w-[200px]">
                  {universal.inviteHash}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCopy(universal.inviteHash)}
                  className="text-green-400 hover:text-black hover:bg-green-400"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-semibold">Signature:</span>
              <div className="flex items-center gap-2">
                <code className="text-xs sm:text-sm truncate max-w-[200px]">
                  {universal.signature}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCopy(universal.signature)}
                  className="text-green-400 hover:text-black hover:bg-green-400"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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