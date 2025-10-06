"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Shield, Key, Activity, Users } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

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

  // Request challenge on mount
  useEffect(() => {
    requestChallenge()
  }, [])

  const requestChallenge = async () => {
    try {
      const response = await fetch("/api/admin/challenge")
      const data = await response.json()

      if (data.success) {
        setChallenge(data.challenge)
        console.log("[v0] Admin challenge received. Sign this nonce with your private key:")
        console.log(data.challenge)
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

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed")
      }

      setIsAuthenticated(true)
      loadAdminData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed")
      requestChallenge() // Get new challenge
    } finally {
      setLoading(false)
    }
  }

  const loadAdminData = async () => {
    try {
      // Load sessions
      const sessionsRes = await fetch("/api/admin/sessions")
      const sessionsData = await sessionsRes.json()
      if (sessionsData.success) {
        setSessions(sessionsData.sessions)
      }

      // Load audit logs
      const logsRes = await fetch("/api/admin/audit-logs?limit=50")
      const logsData = await logsRes.json()
      if (logsData.success) {
        setAuditLogs(logsData.logs)
      }
    } catch (err) {
      console.error("[v0] Failed to load admin data:", err)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Admin Authentication</CardTitle>
            <CardDescription>Sign the challenge nonce with your private key</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuthenticate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="challenge">Challenge Nonce</Label>
                <Textarea
                  id="challenge"
                  value={challenge}
                  readOnly
                  className="font-mono text-xs h-20"
                  placeholder="Loading challenge..."
                />
                <p className="text-xs text-muted-foreground">
                  Copy this nonce and sign it with your admin private key using ECDSA/SHA-256
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signature">Signature</Label>
                <Textarea
                  id="signature"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  className="font-mono text-xs h-24"
                  placeholder="Paste your signature here (base64)"
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
                  placeholder="Paste your public key (PEM format)"
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
    )
  }

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

        <Tabs defaultValue="sessions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="sessions" className="gap-2">
              <Users className="h-4 w-4" />
              Active Sessions
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-2">
              <Activity className="h-4 w-4" />
              Audit Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sessions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription>All currently active user sessions with fingerprints</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div key={session.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="font-medium">{session.email}</p>
                          <p className="text-xs font-mono text-muted-foreground">{session.session_fingerprint}</p>
                        </div>
                        <Badge variant="secondary">Active</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">IP:</span> {session.ip_address}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Last Seen:</span>{" "}
                          {new Date(session.last_seen).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  {sessions.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No active sessions</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Audit Logs</CardTitle>
                <CardDescription>Security events and access attempts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="border-b pb-2 last:border-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={log.event_type.includes("failed") ? "destructive" : "secondary"}>
                            {log.event_type}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{log.ip_address}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                      {log.details && Object.keys(log.details).length > 0 && (
                        <pre className="text-xs text-muted-foreground mt-1 font-mono">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                  {auditLogs.length === 0 && <p className="text-center text-muted-foreground py-8">No audit logs</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
