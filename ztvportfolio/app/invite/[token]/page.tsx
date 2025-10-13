"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowLeft, LogIn } from "lucide-react"

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
      <div className="min-h-screen flex items-center justify-center text-green-500/60 font-mono">
        Loading invite token...
      </div>
    )
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-black text-green-400 p-6">
      {/* 🔙 Top Left — Home */}
      <Link
        href="/"
        className="absolute top-4 left-4 flex items-center gap-1 text-green-500 hover:text-green-300 transition-colors text-sm font-mono"
      >
        <ArrowLeft className="w-4 h-4" />
        Home
      </Link>

      {/* 🔐 Top Right — Login */}
      <Link
        href="/invite"
        className="absolute top-4 right-4 flex items-center gap-1 text-green-500 hover:text-green-300 transition-colors text-sm font-mono"
      >
        Authenticate
        <LogIn className="w-4 h-4" />
      </Link>

      <div className="border border-green-800 rounded-lg p-6 w-full max-w-md bg-black/70 shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-center text-green-400">
          One-Time Access Token
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