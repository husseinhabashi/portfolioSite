"use client"

import { useEffect, useState } from "react"
import { Shield, Activity, Lock } from "lucide-react"
import { Typewriter } from "@/components/ui/typewriter"

export default function MainPage() {
  const [ip, setIp] = useState<string | null>(null)

  useEffect(() => {
  fetch("/api/ip")
    .then(res => res.json())
    .then(data => {
      console.log("📡 Real IP from API:", data.ip);
      setIp(data.ip);
    })
    .catch(err => {
      console.error("❌ Failed to fetch IP:", err);
      setIp("Unknown");
    });
}, []);

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono flex flex-col items-center justify-center text-center p-4">
      <Shield className="h-16 w-16 text-green-400 mb-6 animate-pulse" />

      <Typewriter
        text="Welcome to Zero Trust Vault"
        speed={70}
        className="text-5xl font-bold mb-2"
      />

      <Typewriter
        text="Access Granted ✅"
        speed={50}
        className="text-xl text-green-300 mt-2"
      />

      {ip && (
        <Typewriter
          text={`Your session is active from IP: ${ip}`}
          speed={40}
          className="mt-6 text-sm text-green-500"
        />
      )}

      <div className="mt-12 text-center">
        <Typewriter text="Security telemetry initialized..." speed={35} />
      </div>

      <div className="mt-4">
        <Lock className="h-5 w-5 inline-block mr-2" />
        <Typewriter text="All actions are being monitored." speed={35} />
      </div>
    </div>
  )
}