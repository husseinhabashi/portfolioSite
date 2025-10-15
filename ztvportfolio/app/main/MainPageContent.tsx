"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Shield, Lock } from "lucide-react"
import { Typewriter } from "@/components/ui/typewriter"
import DashboardGrid from "./components/DashboardGrid"
import AIAssistant from "./components/AIAssistant"
import { motion } from "framer-motion"
import { ztFetch } from "../../lib/zt-fetch" // keep relative path to match your tree

// ─────────────────────────────────────────────────────
// Bootstrap: accept f & s in URL once, persist, then clean URL
// ─────────────────────────────────────────────────────
if (typeof window !== "undefined") {
  const params = new URLSearchParams(window.location.search)
  const f = params.get("f")
  const s = params.get("s")
  if (f && s) {
    sessionStorage.setItem("session_fingerprint", f)
    sessionStorage.setItem("session_signature", s)
    localStorage.setItem("headers:x-session-fingerprint", f)
    localStorage.setItem("headers:x-signature", s)
    const clean = window.location.origin + window.location.pathname
    window.history.replaceState({}, document.title, clean)
  }
}

export default function MainPageContent() {
  const router = useRouter()

  // Session state
  const [verified, setVerified] = useState(false)

  // Cinematic states
  const [ip, setIp] = useState<string | null>(null)
  const [shieldVisible, setShieldVisible] = useState(false)
  const [shieldFullyVisible, setShieldFullyVisible] = useState(false)
  const [shieldBrightness, setShieldBrightness] = useState<"normal" | "dim" | "bright">("normal")
  const [fadeOut, setFadeOut] = useState(false)
  const [showIP, setShowIP] = useState(false)
  const [fadeIPLine, setFadeIPLine] = useState(false)
  const [showIPAddress, setShowIPAddress] = useState(false)
  const [moveIPToCenter, setMoveIPToCenter] = useState(false)
  const [moveIPToHeader, setMoveIPToHeader] = useState(false)
  const [showHeader, setShowHeader] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)
  const [showAI, setShowAI] = useState(false)

  const searchParams = useSearchParams()
  const fastload = searchParams.get("fastload") === "true"

  // Terminal sequencing helpers
  const [showLine2, setShowLine2] = useState(false)
  const [showBottom, setShowBottom] = useState(false)
  const [stayDone, setStayDone] = useState(false)
  const [trustStart, setTrustStart] = useState(false)

  // Constants
  const PREFIX = "Active session fingerprint linked to IP:"
  const STAY = "Stay vigilant..."
  const TRUST = "Trust no one"
  const TERMINAL_FADE_MS = 1000

  const ipSourceRef = useRef<HTMLSpanElement | null>(null)

  // Positions
  const IP_POSITION = {
    phone: { top: 1, left: 49 },
    desktop: { top: 2.3, left: 37.5 },
    center: { phone: { top: 50, left: 52 }, desktop: { top: 50, left: 37.5 } },
  }

  // Mobile breakpoint
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640)
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Timings
  const TIMING = {
    fadeIn: 2000,
    fadeOut: 2000,
    pulseDelay: 300,
    pulseDuration: 1000,
    dimStart: 100,
    dimDuration: 800,
    brightenStart: 1500 as number | null,
    ipPrintDelay: 1000,
    headerDelay: 300,
    headerFlyDuration: 650,
    disableDim: true,
  }

  // Timeout manager
  const timeouts = useRef<number[]>([])
  const schedule = (ms: number | null | undefined, fn: () => void) => {
    if (typeof ms === "number" && ms >= 0) {
      const id = window.setTimeout(fn, ms)
      timeouts.current.push(id)
    }
  }

        useEffect(() => {
  if (showDashboard && !showAI) {
    const timer = setTimeout(() => setShowAI(true), 2000)
    return () => clearTimeout(timer)
  }
}, [showDashboard, showAI])

  useEffect(() => {
    return () => {
      timeouts.current.forEach(clearTimeout)
      timeouts.current = []
    }
  }, [])

  // CSS var for shield dim transition
  useEffect(() => {
    document.documentElement.style.setProperty("--shield-dim-duration", `${TIMING.dimDuration}ms`)
  }, [TIMING.dimDuration])

  // Fastload: skip cinematics
  useEffect(() => {
    if (fastload) {
      setShieldVisible(false)
      setShieldFullyVisible(false)
      setFadeOut(true)
      setShowIP(false)
      setShowHeader(true)
      setShowDashboard(true)
      setShowAI(true)
      // Clean URL after fastload handled
      const cleanUrl = window.location.origin + window.location.pathname
      window.history.replaceState({}, document.title, cleanUrl)
    }
  }, [fastload])

  // ─────────────────────────────────────────────────────
  // Zero-Trust: persist headers & verify once on mount
  // ─────────────────────────────────────────────────────
  useEffect(() => {
    const f =
      typeof window !== "undefined"
        ? sessionStorage.getItem("session_fingerprint")
        : null
    const s =
      typeof window !== "undefined"
        ? sessionStorage.getItem("session_signature")
        : null

    if (!f || !s) {
      router.replace("/invite")
      return
    }

    // Always mirror to localStorage for ztFetch (sub-pages/readers)
    localStorage.setItem("headers:x-session-fingerprint", f)
    localStorage.setItem("headers:x-signature", s)

    ;(async () => {
      try {
        const res = await ztFetch("/api/main")
        if (!res.ok) throw new Error("Access denied")
        const data: { success?: boolean; fingerprint?: string } = await res.json()
        if (!data.success) throw new Error("Verification failed")
        setVerified(true)
      } catch {
        router.replace("/invite")
      }
    })()
  }, [router])

  // Shield + IP load (after verified)
  useEffect(() => {
    if (!verified) return
    ;(async () => {
      try {
        const res = await ztFetch("/api/ip")
        const data: { ip?: string } = await res.json()
        setIp(data.ip ?? "Unknown")
      } catch {
        setIp("Unknown")
      } finally {
        setShieldVisible(true)
        schedule(TIMING.fadeIn, () => setShieldFullyVisible(true))
      }
    })()
  }, [verified])

  // Optional dim/bright cycle (disabled by default)
  useEffect(() => {
    if (!showIPAddress || TIMING.disableDim) return
    if (TIMING.dimStart !== null) schedule(TIMING.dimStart, () => setShieldBrightness("dim"))
    if (TIMING.brightenStart !== null) schedule(TIMING.brightenStart, () => setShieldBrightness("bright"))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showIPAddress])

  if (!verified) return null


  function handleIpAnimation() {
  setFadeIPLine(true)
  setTimeout(() => {
    setMoveIPToCenter(true)
    setTimeout(() => {
      setShieldBrightness("bright")
      setTimeout(() => {
        setShieldBrightness("normal")
        setShieldVisible(false)
        setTimeout(() => {
          setShowHeader(true)
          setTimeout(() => {
            setMoveIPToHeader(true)
            // 🕒 Delay dashboard appearance after IP locks into header
            setTimeout(() => setShowDashboard(true), 1000)
          }, TIMING.headerDelay)
        }, TIMING.fadeOut)
      }, TIMING.pulseDuration)
    }, TIMING.pulseDelay)
  }, TIMING.ipPrintDelay)
}

  return (
    <div className="relative min-h-screen bg-black text-green-400 font-mono flex flex-col items-center justify-center text-center px-3 sm:px-4 overflow-hidden">
      {/* 🛡️ Shield */}
      <div
        className={`
          fixed top-[15%] sm:top-[17%] left-1/2 -translate-x-1/2 transition-all ease-in-out
          ${shieldVisible ? "opacity-100" : "opacity-0"}
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
        <Shield className="h-16 w-16 sm:h-24 sm:w-24 text-green-400 drop-shadow-[0_0_25px_rgba(0,255,0,0.6)]" />
      </div>

      {/* 💻 Terminal intro */}
      {!fastload && shieldFullyVisible && !showDashboard && !showHeader && (
        <div
          className={`relative flex flex-col items-center justify-center w-full max-w-[90vw] sm:max-w-2xl transition-opacity duration-1000 ${
            fadeOut ? "opacity-0" : "opacity-100"
          }`}
          style={{ zIndex: 10 }}
        >
          <div
            className="flex flex-col items-center gap-[0.25rem] sm:gap-[0.4rem] text-green-400"
            style={{
              fontFamily: "ui-monospace, Menlo, Monaco, Consolas, monospace",
              whiteSpace: "pre",
              textAlign: "left",
              lineHeight: "1.4em",
            }}
          >
            {/* Line 1 */}
            <span
              className="inline-block text-xs sm:text-base align-top"
              style={{
                width: `${"Welcome to the Zero Trust Vault".length}ch`,
                minHeight: "1.4em",
              }}
            >
              <Typewriter
                text="Welcome to the Zero Trust Vault"
                speed={90}
                cursor
                onComplete={() => setTimeout(() => setShowLine2(true), 500)}
              />
            </span>

            {/* Line 2 */}
            <span
              className="inline-block text-xs sm:text-base align-top"
              style={{
                width: `${"All actions are being monitored".length}ch`,
                minHeight: "1.4em",
              }}
            >
              {showLine2 ? (
                <Typewriter
                  text="All actions are being monitored"
                  speed={90}
                  cursor={false}
                  onComplete={() => setTimeout(() => setShowBottom(true), 700)}
                />
              ) : (
                <span style={{ visibility: "hidden" }}>All actions are being monitored</span>
              )}
            </span>
          </div>

          {/* Bottom banner */}
          {showBottom && (
            <div
              className="fixed bottom-[25%] left-1/2 -translate-x-1/2 z-40 text-xs sm:text-base"
              style={{
                whiteSpace: "nowrap",
                fontFamily: "ui-monospace, Menlo, Monaco, Consolas, monospace",
                color: "rgb(34 197 94)",
              }}
            >
              {/* 1) Stay vigilant... */}
              <span className="inline-block" style={{ width: `${STAY.length}ch`, textAlign: "left" }}>
                <Typewriter
                  text={STAY}
                  speed={90}
                  cursor={!stayDone}
                  onComplete={() => {
                    setStayDone(true)
                    setTimeout(() => setTrustStart(true), 800)
                  }}
                />
              </span>

              {/* spacer */}
              <span className="inline-block" style={{ width: "2ch" }} />

              {/* 2) Trust no one */}
              <span className="inline-block text-red-500" style={{ width: `${TRUST.length}ch`, textAlign: "left" }}>
                {trustStart ? (
                  <Typewriter
                    text={TRUST}
                    speed={90}
                    cursor
                    onComplete={() => {
                      setFadeOut(true)
                      setTimeout(() => setShowIP(true), TERMINAL_FADE_MS + 800)
                    }}
                  />
                ) : (
                  <span style={{ visibility: "hidden" }}>{TRUST}</span>
                )}
              </span>
            </div>
          )}
        </div>
      )}

    {/* 🌐 IP cinematic sequence */}
{showIP && ip && (
  <div
    className={[
      "fixed font-mono transition-all ease-in-out text-center pointer-events-none",
      "text-xs sm:text-base px-2 sm:px-0",
    ].join(" ")}
    style={{
      zIndex: 60,
      maxWidth: "90vw",
      overflow: "hidden",
      textOverflow: "ellipsis",
      transitionDuration: "1000ms",
      position: "fixed",
      left: moveIPToHeader
        ? `${isMobile ? IP_POSITION.phone.left : IP_POSITION.desktop.left}%`
        : moveIPToCenter
        ? `${isMobile ? IP_POSITION.center.phone.left : IP_POSITION.center.desktop.left}%`
        : "50%",
      top: moveIPToHeader
        ? `${isMobile ? IP_POSITION.phone.top : IP_POSITION.desktop.top}rem`
        : moveIPToCenter
        ? `${isMobile ? IP_POSITION.center.phone.top : IP_POSITION.center.desktop.top}%`
        : "60%",
      transform: moveIPToCenter ? "translate(-50%, -50%)" : "translate(-50%, 0)",
      fontFamily: "ui-monospace, Menlo, Monaco, Consolas, monospace",
      whiteSpace: "nowrap",
      textAlign: "left",
    }}
  >
    {/* 🖥️ Desktop: inline IP */}
    {!isMobile && (
      <div className="flex items-baseline justify-center" style={{ whiteSpace: "pre" }}>
        <span
          id="ip-line"
          className={`text-green-400 transition-opacity duration-700 ${fadeIPLine ? "opacity-0" : "opacity-100"}`}
          style={{ display: "inline-block", width: `${PREFIX.length}ch` }}
        >
          <Typewriter
            text={PREFIX}
            speed={45}
            cursor={false}
            onComplete={() => setTimeout(() => setShowIPAddress(true), 800)}
          />
        </span>
        <span>&nbsp;</span>
        <span
          ref={ipSourceRef}
          id="ip-address"
          className="text-green-500 font-semibold overflow-hidden truncate text-xs sm:text-base"
          style={{
            display: "inline-block",
            width: `${Math.max((ip ?? "").length, 15)}ch`,
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            verticalAlign: "bottom",
          }}
        >
          {showIPAddress ? (
            <Typewriter
              text={ip!}
              speed={50}
              cursor={false}
              onComplete={() => handleIpAnimation()}
            />
          ) : (
            <span style={{ visibility: "hidden" }}>000.000.000.000</span>
          )}
        </span>
      </div>
    )}

    {/* 📱 Mobile: IP prints on next line */}
    {isMobile && (
      <div className="flex flex-col items-center justify-center space-y-1" style={{ whiteSpace: "pre" }}>
        <span
          id="ip-line"
          className={`text-green-400 transition-opacity duration-700 ${fadeIPLine ? "opacity-0" : "opacity-100"}`}
          style={{ display: "inline-block", width: `${PREFIX.length}ch` }}
        >
          <Typewriter
            text={PREFIX}
            speed={45}
            cursor={false}
            onComplete={() => setTimeout(() => setShowIPAddress(true), 800)}
          />
        </span>

        <span
          ref={ipSourceRef}
          id="ip-address"
          className="text-green-500 font-semibold overflow-hidden truncate text-xs"
          style={{
            display: "inline-block",
            width: `${Math.max((ip ?? "").length, 15)}ch`,
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {showIPAddress ? (
            <Typewriter
              text={ip!}
              speed={50}
              cursor={false}
              onComplete={() => handleIpAnimation()}
            />
          ) : (
            <span style={{ visibility: "hidden" }}>000.000.000.000</span>
          )}
        </span>
      </div>
    )}
  </div>
)}

      {/* 🔒 Lock icon */}
      <div
        className={`fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 transition-opacity duration-1000 ${
          showHeader ? "opacity-0" : "opacity-30"
        }`}
      >
        <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
      </div>

      {/* ✅ Header */}
      {showHeader && (
        <header className="fixed top-0 left-0 w-full border-b border-green-800 bg-black/80 backdrop-blur-md z-50 animate-fade-in">
          <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
            {/* 💻 Desktop */}
            <div className="hidden sm:flex items-center justify-between w-full">
              <button
                onClick={async () => {
                  try {
                    sessionStorage.removeItem("session_fingerprint")
                    sessionStorage.removeItem("session_signature")
                    localStorage.removeItem("headers:x-session-fingerprint")
                    localStorage.removeItem("headers:x-signature")
                    await fetch("/api/session/destroy", { method: "POST" }).catch(() => {})
                    setVerified(false)
                    setShowHeader(false)
                    setTimeout(() => router.replace("/invite"), 150)
                  } catch {
                    router.replace("/invite")
                  }
                }}
                className="flex items-center gap-2 text-red-400 border border-red-400 hover:text-black hover:bg-red-400 transition-all rounded-md px-4 py-2 text-sm font-semibold"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 9V5a3 3 0 016 0v4m-9 4h12v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6z" />
                </svg>
                Log Out
              </button>

              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-green-400 shrink-0" />
                <span className="font-bold text-lg text-green-400 tracking-wide truncate">Main Page</span>
              </div>
            </div>

            {/* 📱 Mobile */}
            <div className="flex sm:hidden items-center justify-between w-full">
              <button
                onClick={async () => {
                  try {
                    sessionStorage.removeItem("session_fingerprint")
                    sessionStorage.removeItem("session_signature")
                    localStorage.removeItem("headers:x-session-fingerprint")
                    localStorage.removeItem("headers:x-signature")
                    await fetch("/api/session/destroy", { method: "POST" }).catch(() => {})
                    setVerified(false)
                    setShowHeader(false)
                    setTimeout(() => router.replace("/invite"), 150)
                  } catch {
                    router.replace("/invite")
                  }
                }}
                className="text-red-400 hover:text-black hover:bg-red-400 border border-red-400 rounded-md p-1 transition-all flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 9V5a3 3 0 016 0v4m-9 4h12v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6z" />
                </svg>
              </button>
              <span className="font-bold text-xs text-green-400 tracking-wide text-right">Main Page</span>
            </div>
          </div>
        </header>
      )}

      {/* 🎬 Cinematic Intro (only runs if NOT fastload) */}
      {!fastload && !showIP && shieldFullyVisible && (
        <div
          className={`relative flex flex-col items-center justify-center w-full max-w-[90vw] sm:max-w-2xl transition-opacity duration-1000 ${
            fadeOut ? "opacity-0" : "opacity-100"
          }`}
          style={{ zIndex: 10 }}
        >
          {/* ... your cinematic terminal text (Welcome / All actions / Stay vigilant...) */}
        </div>
      )}

 {showDashboard && (
  <div className="relative flex flex-col items-center justify-center w-full pt-24 pb-16 px-6">
    <DashboardGrid onComplete={() => setShowAI(true)} />

    {/* Fallback safety: show Nova after 2s even if animation never triggers */}
  </div>
)}

{/* 🧠 Nova AI Assistant — bottom-right entrance */}
{showAI && (
  <motion.div
    initial={{
      opacity: 0,
      scale: 0.8,
      y: 30,
      x: 30,
      filter: "blur(8px)",
    }}
    animate={{
      opacity: 1,
      scale: 1,
      y: 0,
      x: 0,
      filter: "blur(0px)",
    }}
    transition={{
      duration: 1,
      ease: "easeOut",
    }}
    className="fixed bottom-6 right-6 z-50"
    style={{
      boxShadow: "none",
      filter: "none",
    }}
  >
    <AIAssistant />
  </motion.div>
)}
        </div>
      )}