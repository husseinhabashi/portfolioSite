"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Shield, Key, Activity, Users, ArrowLeft, MailPlus } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

interface Session {
  id: number
  session_fingerprint: string
  ip_address: string
  user_agent: string
  first_seen: string
  last_seen: string
  email: string
  invite_hash: string
}

interface AuditLog {
  id: number
  event_type: string
  ip_address: string
  user_agent: string
  created_at: string
  details: any
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [challenge, setChallenge] = useState("")
  const [signature, setSignature] = useState("")
  const [publicKey, setPublicKey] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [sessions, setSessions] = useState<Session[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])

  // 🔐 Invite creation state
  const [inviteEmail, setInviteEmail] = useState("")
  const [expiresInDays, setExpiresInDays] = useState(7)
  const [inviteResult, setInviteResult] = useState<any>(null)
  const [inviteLoading, setInviteLoading] = useState(false)
  const [bindIp, setBindIp] = useState(true) // ✅ new toggle for IP binding

  useEffect(() => {
    requestChallenge()
  }, [])

  const requestChallenge = async () => {
    try {
      const response = await fetch("/api/admin/challenge")
      const data = await response.json()
      if (data.success) {
        setChallenge(data.challenge)
        console.log("[v0] Admin challenge received:", data.challenge)
      }
    } catch (err) {
      console.error("[v0] Failed to request challenge:", err)
    }
  }

  const handleAuthenticate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const response = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challenge, signature, publicKey }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Authentication failed")
      setIsAuthenticated(true)
      loadAdminData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed")
      requestChallenge()
    } finally {
      setLoading(false)
    }
  }

  const loadAdminData = async () => {
    try {
      const sessionsRes = await fetch("/api/admin/sessions")
      const sessionsData = await sessionsRes.json()
      if (sessionsData.success) setSessions(sessionsData.sessions)

      const logsRes = await fetch("/api/admin/audit-logs?limit=50")
      const logsData = await logsRes.json()
      if (logsData.success) setAuditLogs(logsData.logs)
    } catch (err) {
      console.error("[v0] Failed to load admin data:", err)
    }
  }

  const handleCreateInvite = async () => {
    setInviteLoading(true)
    setInviteResult(null)
    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, expiresInDays, bindIp }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to generate invite")
      setInviteResult(data.invite)
    } catch (err) {
      console.error("[invite] Error:", err)
      setInviteResult({ error: err instanceof Error ? err.message : "Unknown error" })
    } finally {
      setInviteLoading(false)
    }
  }

  // --- Authentication screen ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
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
              <Shield className="h-6 w-6 text-green-400 shrink-0" />
              <span className="font-bold text-lg sm:text-xl text-center sm:text-right">Admin Authentication</span>
            </div>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl shadow-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl">Authenticate as Admin</CardTitle>
              <CardDescription>Sign the challenge nonce with your private key</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAuthenticate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="challenge">Challenge Nonce</Label>
                  <Textarea id="challenge" value={challenge} readOnly className="font-mono text-xs h-20" />
                  <p className="text-xs text-muted-foreground">
                    Copy this nonce and sign it with your admin private key using ECDSA/SHA-256.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signature">Signature</Label>
                  <Textarea
                    id="signature"
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    className="font-mono text-xs h-24"
                    placeholder="Paste your signature (base64)"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="publicKey">Public Key</Label>
                  <Textarea
                    id="publicKey"
                    value={publicKey}
                    onChange={(e) => setPublicKey(e.target.value)}
                    className="font-mono text-xs h-32"
                    placeholder="Paste your public key (PEM)"
                    required
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? "Verifying..." : "Authenticate"}
                  </Button>
                  <Button type="button" variant="outline" onClick={requestChallenge}>
                    New Challenge
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // --- Authenticated Admin Panel ---
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8" />
              Admin Panel
            </h1>
            <p className="text-muted-foreground mt-1">Cryptographically authenticated access</p>
          </div>
          <Badge variant="outline" className="gap-2">
            <Key className="h-3 w-3" />
            Authenticated
          </Badge>
        </div>

        <Tabs defaultValue="invite" className="space-y-4">
          <TabsList>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
            <TabsTrigger value="invite">Invites</TabsTrigger>
          </TabsList>

          {/* --- Invites --- */}
          <TabsContent value="invite">
            <Card>
              <CardHeader>
                <CardTitle>Create Invite</CardTitle>
                <CardDescription>Generate cryptographically signed invites</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="user@example.com" />
                </div>
                <div className="space-y-2">
                  <Label>Expires In (days)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={expiresInDays}
                    onChange={(e) => setExpiresInDays(Number(e.target.value))}
                  />
                </div>

                {/* ✅ Toggle for IP binding */}
                <div className="flex items-center gap-3 mt-4">
                  <Switch id="bind-ip" checked={bindIp} onCheckedChange={setBindIp} />
                  <Label htmlFor="bind-ip" className="text-sm">
                    Bind IP to invite (recommended)
                  </Label>
                </div>

                <Button onClick={handleCreateInvite} disabled={inviteLoading} className="mt-2">
                  {inviteLoading ? "Generating..." : "Generate Invite"}
                  <MailPlus className="ml-2 h-4 w-4" />
                </Button>

                {inviteResult && (
                  <div className="mt-6 border rounded-md p-4 font-mono text-xs bg-muted/10">
                    {inviteResult.error ? (
                      <p className="text-red-500">{inviteResult.error}</p>
                    ) : (
                      <>
                        <p><strong>Email:</strong> {inviteResult.email}</p>
                        <p><strong>Hash:</strong> {inviteResult.inviteHash}</p>
                        <p><strong>Signature:</strong> {inviteResult.signature}</p>
                        <p><strong>Expires:</strong> {inviteResult.expiresAt}</p>
                        <p><strong>IP Binding:</strong> {inviteResult.ipBound ? "Enabled" : "Disabled"}</p>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* --- Other Tabs unchanged --- */}
          {/* Sessions and Audit sections remain as in your code */}
        </Tabs>
      </div>
    </div>
  )
}