"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Shield, Lock, ArrowLeft } from "lucide-react"
import TerminalScene from "@/components/ui/TerminalScene"
import { Typewriter } from "@/components/ui/typewriter"
import FadeLayer from "@/components/ui/FadeLayer"

export default function MainPage() {
  const router = useRouter()

  // 🔐 Zero-Trust verification
  const [verified, setVerified] = useState(false)

  // 🎞️ Cinematic states
  const [ip, setIp] = useState<string | null>(null)
  const [shieldVisible, setShieldVisible] = useState(false)
  const [shieldFullyVisible, setShieldFullyVisible] = useState(false)
  const [shieldBrightness, setShieldBrightness] = useState<"normal" | "dim" | "bright">("normal")

  const [fadeOut, setFadeOut] = useState(false)
  const [showIP, setShowIP] = useState(false)
  const [showVigilant, setShowVigilant] = useState(false)
  const [showTrust, setShowTrust] = useState(false)
  const [fadeIPLine, setFadeIPLine] = useState(false)
  const [showIPAddress, setShowIPAddress] = useState(false)
  const [moveIPToCenter, setMoveIPToCenter] = useState(false)
  const [moveIPToHeader, setMoveIPToHeader] = useState(false)
  const [showHeader, setShowHeader] = useState(false)

  // 🕹️ Master cinematic control
  const TIMING = {
    // Shield transitions
    fadeIn: 2000,          // shield fade-in duration
    fadeOut: 2000,         // shield fade-out duration
    fadeOutStart: 1000,    // when to start fading the shield (before header)
    dimStart: 100,         // when to dim after IP starts printing
    dimDuration: 800,      // CSS transition speed for dim
    brightenStart: 1500 as number | null, // when to brighten again

    // IP flow
    ipPrintDelay: 1000,    // delay after prefix finishes before IP shows
    ipMoveDelay: 2000,     // time IP stays centered
    headerDelay: 3000,     // delay before IP moves into header

    // Global switch
    disableDim: false,     // true → disables dim/bright transitions
  }

  // 🧭 Timeout manager
  const timeouts = useRef<number[]>([])
  const schedule = (ms: number | null | undefined, fn: () => void) => {
    if (typeof ms === "number" && ms >= 0) {
      const id = window.setTimeout(fn, ms)
      timeouts.current.push(id)
    }
  }
  useEffect(() => {
    return () => {
      timeouts.current.forEach(clearTimeout)
      timeouts.current = []
    }
  }, [])

  // ⚙️ CSS transition variable
  useEffect(() => {
    document.documentElement.style.setProperty("--shield-dim-duration", `${TIMING.dimDuration}ms`)
  }, [TIMING.dimDuration])

  // 🧠 Session verification
  useEffect(() => {
    const fingerprint = sessionStorage.getItem("session_fingerprint")
    const signature = sessionStorage.getItem("session_signature")

    if (!fingerprint || !signature) {
      router.replace("/invite")
      return
    }

    fetch("/api/main", {
      headers: { "x-session-fingerprint": fingerprint, "x-signature": signature },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Access denied")
        const data = await res.json()
        if (data.success) setVerified(true)
        else throw new Error("Verification failed")
      })
      .catch(() => router.replace("/invite"))
  }, [router])

  // 🛡️ Shield initialization
  useEffect(() => {
    if (!verified) return

    fetch("/api/ip")
      .then((res) => res.json())
      .then((data) => setIp(data.ip ?? "Unknown"))
      .catch(() => setIp("Unknown"))
      .finally(() => {
        setShieldVisible(true)
        schedule(TIMING.fadeIn, () => setShieldFullyVisible(true))
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verified])

  // 💡 Dim/Bright control synced to IP appearance
  useEffect(() => {
    if (!showIPAddress || TIMING.disableDim) return
    if (TIMING.dimStart !== null) schedule(TIMING.dimStart, () => setShieldBrightness("dim"))
    if (TIMING.brightenStart !== null) schedule(TIMING.brightenStart, () => setShieldBrightness("bright"))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showIPAddress])

  if (!verified) return null

  // 💬 Terminal intro lines
  const lines = [
    { text: "Welcome to the Zero Trust Vault", className: "text-sm sm:text-base text-green-400" },
    { text: "All actions are being monitored.", className: "text-sm sm:text-base text-green-400" },
  ]

  // 🎬 Terminal sequence flow
  const handleSceneDone = () => {
    setShowVigilant(true)
    setTimeout(() => {
      setShowTrust(true)
      setTimeout(() => {
        setFadeOut(true)
        setTimeout(() => setShowIP(true), 1500)
      }, 5000)
    }, 2500)
  }

  return (
    <div className="relative min-h-screen bg-black text-green-400 font-mono flex flex-col items-center justify-center text-center px-4 overflow-hidden">

      {/* 🛡️ Shield */}
      <div
  className={`
    fixed top-[17%] left-1/2 -translate-x-1/2 transition-all ease-in-out
    ${shieldVisible ? "opacity-100" : "opacity-0"}
    ${showHeader ? "scale-100" : "scale-100"}  /* keep scale constant to avoid resize */
    ${shieldBrightness === "bright"
      ? "brightness-bright"
      : shieldBrightness === "dim"
      ? "brightness-dim"
      : "brightness-normal"}
  `}
  style={{
    transitionProperty: "opacity, filter",
    transitionDuration: `${shieldVisible ? TIMING.fadeIn : TIMING.fadeOut}ms`,
    transitionTimingFunction: "ease-in-out",
  }}
>
  <Shield className="h-20 w-20 sm:h-24 sm:w-24 text-green-400 drop-shadow-[0_0_25px_rgba(0,255,0,0.6)]" />
</div>

      {/* 💻 Terminal intro */}
      {!showIP && shieldFullyVisible && (
        <div
          className={`flex flex-col items-center justify-center w-full max-w-2xl transition-opacity duration-1000 ${
            fadeOut ? "opacity-0" : "opacity-100"
          }`}
        >
          <TerminalScene
            lines={lines}
            lineDelay={700}
            lineHeight={36}
            speed={90}
            fadeNonPinned
            fadeDelay={2200}
            onDone={handleSceneDone}
            lineGapClass="gap-3"
          />

          {showVigilant && (
            <div className="text-sm sm:text-base text-green-400 mt-1">
              <Typewriter text="Stay vigilant..." speed={90} cursor={!showTrust} />
              {showTrust && (
                <span className="text-red-500 ml-2">
                  <Typewriter text="Trust no one." speed={90} cursor />
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* 🌐 IP cinematic sequence */}
      {showIP && ip && (
        <div
          className={[
            "absolute text-sm sm:text-base font-mono flex items-center justify-center transition-all duration-1000 ease-in-out",
            moveIPToHeader
              ? "top-[-0.1rem] left-39/100 -translate-x-1/2 translate-y-0"
              : moveIPToCenter
              ? "top-1/2 left-39/100 -translate-x-1/2 -translate-y-1/2"
              : "top-[60%] left-1/2 -translate-x-1/2",
          ].join(" ")}
          style={{ zIndex: 60 }}
        >
          {/* Prefix */}
          <span
            id="ip-line"
            className={`text-green-400 transition-opacity duration-1000 ${
              fadeIPLine ? "opacity-0" : "opacity-100"
            }`}
          >
            <Typewriter
              text="Active session fingerprint linked to IP: "
              speed={45}
              onComplete={() => schedule(1000, () => setShowIPAddress(true))}
            />
          </span>

          {/* IP address reveal */}
          {showIPAddress && (
            <span className="text-green-500 font-semibold ml-1" id="ip-address">
              <Typewriter
                text={ip}
                speed={50}
                cursor={false}
                onComplete={() => {
                  setFadeIPLine(true)

                  // IP moves to center
                  schedule(TIMING.ipPrintDelay, () => {
                    setMoveIPToCenter(true)

                    // ⚡ Shield fade-out before header fade-in
                    schedule(TIMING.fadeOutStart, () => {
                      setShieldBrightness("normal")
                      setShieldVisible(false) // fades out using TIMING.fadeOut
                    })

                    // Header reveal after shield gone
                    schedule(TIMING.fadeOutStart + TIMING.fadeOut, () => {
                      setShowHeader(true)
                    })

                    // Then IP moves to header
                    schedule(TIMING.headerDelay, () => {
                      setMoveIPToHeader(true)
                    })
                  })
                }}
              />
            </span>
          )}
        </div>
      )}

      {/* 🔒 Lock icon */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 transition-opacity duration-1000 ${
          showHeader ? "opacity-0" : "opacity-30"
        }`}
      >
        <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
      </div>

      {/* ✅ Header */}
      {showHeader && (
        <header className="fixed top-0 left-0 w-full border-b border-green-800 bg-black/80 backdrop-blur-md z-50 animate-fade-in">
          <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <Link href="/" className="w-full sm:w-auto">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 w-full sm:w-auto justify-center sm:justify-start text-green-400 hover:text-black hover:bg-green-400 transition-all"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
              <Shield className="h-6 w-6 text-green-400 shrink-0" />
              <span className="font-bold text-lg sm:text-xl text-center sm:text-right text-green-400 tracking-wide">
                Main Page
              </span>
            </div>
          </div>
        </header>
      )}
    </div>
  )
}