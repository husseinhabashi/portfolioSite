"use client"

import { useEffect, useState } from "react"
import { createCanarySignature } from "@/lib/crypto"

export function TrackingPixel() {
  const [pixelUrl, setPixelUrl] = useState<string | null>(null)

  useEffect(() => {
    // Fetch session info to generate signature
    fetch("/api/session/info")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const sessionFingerprint = data.session.fingerprint
          const timestamp = Date.now()
          const currentUrl = window.location.href

          // Generate canary signature
          const signature = createCanarySignature(sessionFingerprint, currentUrl, timestamp)

          // Create pixel URL with signature
          const url = `/api/track/pixel?sig=${signature}`
          setPixelUrl(url)

          console.log("[v0] Tracking pixel loaded with signature:", signature.substring(0, 16) + "...")
        }
      })
      .catch((err) => console.error("[v0] Failed to load tracking pixel:", err))
  }, [])

  if (!pixelUrl) return null

  return (
    <img
      src={pixelUrl || "/placeholder.svg"}
      alt=""
      width="1"
      height="1"
      style={{ position: "absolute", opacity: 0 }}
    />
  )
}
