"use client"

import { useEffect, useState } from "react"
import { Shield, Activity, Lock } from "lucide-react"

export default function MainPage() {
  const [ip, setIp] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/ip")
      .then(res => res.json())
      .then(data => setIp(data.ip))
      .catch(() => setIp("Unknown"))
  }, [])

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono flex flex-col items-center justify-center">
      <Shield className="h-16 w-16 text-green-400 mb-4 animate-pulse" />
      <h1 className="text-5xl font-bold mb-2">Welcome to Zero Trust Vault</h1>
      <p className="text-xl text-green-300">Access Granted ✅</p>

      {ip && (
        <p className="mt-6 text-sm text-green-500">
          Your session is active from IP: <span className="font-bold">{ip}</span>
        </p>
      )}

      <div className="mt-12 text-center">
        <Activity className="h-6 w-6 inline-block mr-2 animate-spin" />
        <span>Security telemetry initialized...</span>
      </div>

      <div className="mt-4">
        <Lock className="h-5 w-5 inline-block mr-2" />
        <span>All actions are being monitored.</span>
      </div>
    </div>
  )
}