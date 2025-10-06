"use client"

import { useEffect, useState } from "react"
import { Fingerprint } from "lucide-react"

export function SessionFingerprintDisplay() {
  const [fingerprint, setFingerprint] = useState<string | null>(null)
  const [ipAddress, setIpAddress] = useState<string | null>(null)

  useEffect(() => {
    // Fetch session info
    fetch("/api/session/info")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setFingerprint(data.session.fingerprint)
          setIpAddress(data.session.ipAddress)
          // Also log to console for security transparency
          console.log("[v0] Session Fingerprint:", data.session.fingerprint)
          console.log("[v0] Bound IP:", data.session.ipAddress)
          console.log("[v0] First Seen:", data.session.firstSeen)
          console.log("[v0] Last Seen:", data.session.lastSeen)
        }
      })
      .catch((err) => console.error("[v0] Failed to fetch session info:", err))
  }, [])

  if (!fingerprint) return null

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
      <Fingerprint className="h-3 w-3" />
      <span className="hidden sm:inline">Session:</span>
      <span className="truncate max-w-[200px]" title={fingerprint}>
        {fingerprint.substring(0, 16)}...
      </span>
      {ipAddress && <span className="hidden md:inline text-muted-foreground/70">| IP: {ipAddress}</span>}
    </div>
  )
}
