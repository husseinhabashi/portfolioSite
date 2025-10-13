"use client"

import { useEffect, useState } from "react"

export default function InviteTokenPage({ params }: { params: { token: string } }) {
  const [inviteData, setInviteData] = useState<any>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchInvite() {
      try {
        const res = await fetch(`/api/invites/${params.token}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Failed to load invite")

        // ✅ only store the invite object
        setInviteData(data.invite)
      } catch (err: any) {
        setError(err.message)
      }
    }
    fetchInvite()
  }, [params.token])

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center text-red-500">
        ❌ {error}
      </div>
    )
  }

  if (!inviteData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading invite...
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-green-400 p-6">
      <div className="border border-green-800 rounded-lg p-6 w-full max-w-md bg-black/70 shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-center text-green-400">
          One-Time Access Credentials
        </h1>
        <p className="text-sm text-green-500 text-center mb-6">
          ⚠️ Copy these credentials securely — this page self-destructs after use.
        </p>

        <div className="font-mono text-xs space-y-3 break-all text-green-300">
          <p><strong>Email:</strong> {inviteData.email}</p>
          <p><strong>Invite Hash:</strong> {inviteData.inviteHash}</p>
          <p><strong>Signature:</strong> {inviteData.signature}</p>
          <p><strong>Expires:</strong> {inviteData.expiresAt ?? "Never"}</p>
        </div>

        <p className="text-[10px] text-center text-green-700 mt-8">
          ZeroTrustVault © 2025 — Minimal exposure. Maximum security.
        </p>
      </div>
    </div>
  )
}