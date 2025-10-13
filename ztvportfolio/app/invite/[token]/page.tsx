"use client"

import { useEffect, useState } from "react"

export default function InviteTokenPage({ params }: { params: { token: string } }) {
  const [inviteData, setInviteData] = useState<any>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchInvite() {
      try {
        const res = await fetch(`/api/invite/${params.token}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Failed to load invite")
        setInviteData(data)
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-6">
      <div className="border rounded-md p-6 w-full max-w-md bg-muted/20 shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-center">🎟 One-Time Invite</h1>
        <p className="text-sm text-muted-foreground text-center mb-4">
          Copy these credentials securely — this page will self-destruct after use.
        </p>
        <div className="font-mono text-xs space-y-2 break-all">
          <p><strong>Email:</strong> {inviteData.email}</p>
          <p><strong>Invite Hash:</strong> {inviteData.inviteHash}</p>
          <p><strong>Signature:</strong> {inviteData.signature}</p>
        </div>
      </div>
    </div>
  )
}