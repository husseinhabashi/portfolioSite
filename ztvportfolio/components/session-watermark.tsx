"use client"

import { useEffect, useState } from "react"

export function SessionWatermark() {
  const [watermarkData, setWatermarkData] = useState<{
    fingerprint: string
    timestamp: string
  } | null>(null)

  useEffect(() => {
    // Fetch session info for watermark
    fetch("/api/session/info")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setWatermarkData({
            fingerprint: data.session.fingerprint.substring(0, 16),
            timestamp: new Date().toISOString(),
          })
        }
      })
      .catch((err) => console.error("[v0] Failed to fetch watermark data:", err))
  }, [])

  if (!watermarkData) return null

  return (
    <div
      className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
      style={{
        opacity: 0.03,
        userSelect: "none",
      }}
    >
      <div className="transform rotate-[-45deg] text-foreground font-mono text-sm space-y-2 text-center">
        <div>SESSION: {watermarkData.fingerprint}</div>
        <div>{watermarkData.timestamp}</div>
      </div>
    </div>
  )
}
