"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ztFetch } from "@/lib/zt-fetch"

export default function ZeroTrustGuard({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [verified, setVerified] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await ztFetch("/api/main")
        if (!res.ok) throw new Error("Access denied")
        const data = await res.json()
        if (!data.success) throw new Error("Verification failed")
        setVerified(true)
      } catch {
        router.replace("/invite")
      } finally {
        setChecking(false)
      }
    })()
  }, [router])

  if (checking)
    return (
      <div className="text-green-500 text-center mt-10">
        Verifying Zero Trust session...
      </div>
    )

  if (!verified) return null
  return <>{children}</>
}