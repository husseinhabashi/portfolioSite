"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

export default function InviteViewer() {
  const { token } = useParams()
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch(`/api/invite/${token}`)
      .then(res => res.json())
      .then(data => {
        if (!data.success) setError(data.error)
        else setData(data)
      })
      .catch(() => setError("Network error"))
  }, [token])

  if (error) return <div className="p-6 text-red-400">❌ {error}</div>
  if (!data) return <div className="p-6 text-green-400">Loading invite...</div>

  return (
    <div className="min-h-screen bg-black text-green-400 flex flex-col items-center justify-center font-mono p-6">
      <h1 className="text-2xl mb-4">✅ Invite Loaded</h1>
      <div className="bg-green-950/20 border border-green-800 rounded-lg p-4 w-full max-w-md space-y-2">
        <p><b>Email:</b> {data.email}</p>
        <p><b>Invite Hash:</b> {data.inviteHash}</p>
        <p><b>Signature:</b> {data.signature}</p>
      </div>
      <p className="text-xs mt-4 text-green-500/70">This link self-destructs after use.</p>
    </div>
  )
}