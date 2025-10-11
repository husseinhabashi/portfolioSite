"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Shield, Lock, ArrowLeft } from "lucide-react"
import TerminalScene from "@/components/ui/TerminalScene"
import { Typewriter } from "@/components/ui/typewriter"
import FadeLayer from "@/components/ui/FadeLayer"

export default function MainPage() {
  const router = useRouter()

  // 🔐 Zero-Trust verification state
  const [verified, setVerified] = useState(false)

  // Cinematic animation states
  const [ip, setIp] = useState<string | null>(null)
  const [shieldVisible, setShieldVisible] = useState(false)
  const [shieldFullyVisible, setShieldFullyVisible] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)
  const [showIP, setShowIP] = useState(false)
  const [showVigilant, setShowVigilant] = useState(false)
  const [showTrust, setShowTrust] = useState(false)
  const [fadeIPLine, setFadeIPLine] = useState(false)
  const [showIPAddress, setShowIPAddress] = useState(false)
  const [moveIPToCenter, setMoveIPToCenter] = useState(false)
  const [moveIPToHeader, setMoveIPToHeader] = useState(false)
  const [showHeader, setShowHeader] = useState(false)

  const [shieldBrightness, setShieldBrightness] = useState<"normal" | "dim" | "bright">("normal")


  const SHIELD_FADE_DURATION = 2500

  // 🎞️ Animation timings (tune these like a film editor)
const TIMING = {
  fadeIn: 2000,         // Shield fade-in duration
  dimStart: 500,       // When dimming starts
  dim: 500,            // How long the dim lasts
  brightenStart: 1000, // When to brighten (after dim)
  brighten: 1500,       // Brighten duration
  fadeOut: 2500,        // Fade away before header appears
  ipPrintDelay: 1000,   // Wait after IP prints before move
  ipMoveDelay: 2000,    // How long IP travels before header
  headerDelay: 3000,    // Delay before header fade-in
  disableDim: false,    // Set true to fully disable dimming logic
}

useEffect(() => {
  if (shieldBrightness === "dim" && TIMING.dim !== null) {
    document.documentElement.style.setProperty("--shield-dim-duration", `${TIMING.dim}ms`)
  } else {
    document.documentElement.style.setProperty("--shield-dim-duration", "800ms") // default
  }
}, [shieldBrightness])

  // 🧠 Zero-Trust session verification
  useEffect(() => {
    const fingerprint = sessionStorage.getItem("session_fingerprint")
    const signature = sessionStorage.getItem("session_signature")

    if (!fingerprint || !signature) {
      router.replace("/invite")
      return
    }

    fetch("/api/main", {
      headers: {
        "x-session-fingerprint": fingerprint,
        "x-signature": signature,
      },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Access denied")
        const data = await res.json()
        if (data.success) setVerified(true)
        else throw new Error("Verification failed")
      })
      .catch(() => router.replace("/invite"))
  }, [router])

  // 🕵️ Wait until verified before showing cinematic
  useEffect(() => {
    if (!verified) return

    fetch("/api/ip")
      .then((res) => res.json())
      .then((data) => setIp(data.ip ?? "Unknown"))
      .catch(() => setIp("Unknown"))
      .finally(() => {
        setShieldVisible(true)
        const timer = setTimeout(() => setShieldFullyVisible(true), SHIELD_FADE_DURATION)
        return () => clearTimeout(timer)
      })
  }, [verified])

  if (!verified) return null // Don’t render anything until verified

  const lines = [
    { text: "Welcome to the Zero Trust Vault", className: "text-sm sm:text-base text-green-400" },
    { text: "All actions are being monitored.", className: "text-sm sm:text-base text-green-400" },
  ]

  const handleSceneDone = () => {
    setShowVigilant(true)
    setTimeout(() => {
      setShowTrust(true)
      setTimeout(() => {
        setFadeOut(true)
        setTimeout(() => {
          setShowIP(true)
        }, 1500)
      }, 5000)
    }, 2500)
  }

  return (
    <div className="relative min-h-screen bg-black text-green-400 font-mono flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      {/* 🛡️ Shield fade-in animation */}
    <div
  className={`
    fixed top-[17%] left-1/2 -translate-x-1/2 ease-in-out
    ${shieldVisible && !showHeader ? "opacity-100 scale-100" : "opacity-0 scale-90"}
    ${
      shieldBrightness === "bright" ? "brightness-150" :
      shieldBrightness === "dim" ? "brightness-30" :
      "brightness-100"
    }
  `}
  style={{
    transitionProperty: "opacity, transform, filter",
    transitionDuration: shieldVisible ? `${TIMING.fadeIn}ms` : `${TIMING.fadeOut}ms`,
    transitionTimingFunction: "ease-in-out",
    filter: `brightness(${
      shieldBrightness === "bright" ? "1.5" :
      shieldBrightness === "dim" ? "0.3" :
      "1"
    })`,
  }}
>
  <Shield className="h-20 w-20 sm:h-24 sm:w-24 text-green-400 drop-shadow-[0_0_25px_rgba(0,255,0,0.6)]" />
</div>
      {/* 💻 Terminal sequence */}
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

          {/* 🧠 Stay vigilant... Trust no one */}
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

      {/* 🌓 Fade overlay for transition */}
      <FadeLayer visible={showIP} duration={1000}>
        <div className="fixed inset-0 bg-black opacity-80" />
      </FadeLayer>

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
          <span
            id="ip-line"
            className={`text-green-400 transition-opacity duration-1000 ${
              fadeIPLine ? "opacity-0" : "opacity-100"
            }`}
          >
            <Typewriter
              text="Active session fingerprint linked to IP: "
              speed={45}
              onComplete={() => {
                setTimeout(() => setShowIPAddress(true), 1000)}
              }
            />
          </span>

          {showIPAddress && (
            <span className="text-green-500 font-semibold ml-1" id="ip-address">
              <Typewriter
                text={ip}
                speed={50}
                cursor={false}
               onComplete={() => {
  // 🎬 Step 1 — Dim when IP starts printing
  setShieldBrightness("dim")
  setFadeIPLine(true)
  
  setTimeout(() => {
    setMoveIPToCenter(true)

    // 💡 Step 2 — Brighten when IP starts moving (after dim duration)
    setTimeout(() => {
      setShieldBrightness("bright")
    }, TIMING.dim)

    setTimeout(() => {
      // ☠️ Step 3 — Fade out shield before header
      setShieldBrightness("normal")
      setShieldVisible(false)
      setShowHeader(true)

      setTimeout(() => {
        // 🧭 Step 4 — Move IP to header position
        setMoveIPToHeader(true)
      }, TIMING.headerDelay)
    }, TIMING.ipMoveDelay + TIMING.dim)
  }, TIMING.ipPrintDelay)
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