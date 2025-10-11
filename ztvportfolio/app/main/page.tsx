"use client"

import { useEffect, useRef, useState, type CSSProperties } from "react"
import { useRouter } from "next/navigation"
import { Shield, Lock, ArrowLeft } from "lucide-react"
import TerminalScene from "@/components/ui/TerminalScene"
import { Typewriter } from "@/components/ui/typewriter"

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
  const [showHeader, setShowHeader] = useState(false)
  const [moveIPToHeader, setMoveIPToHeader] = useState(false)

  const PREFIX = "Active session fingerprint linked to IP:";  // the printed line
  const STAY = "Stay vigilant...";
  const TRUST = "Trust no one";

  // 🧷 IP → Header FLIP animation
  const ipSourceRef = useRef<HTMLSpanElement | null>(null)
  const ipTargetRef = useRef<HTMLSpanElement | null>(null)
  const IP_POSITION = {
  phone: { top: 0.8, left: 50 },   
  desktop: { top: 2, left: 40 },    
  center: { phone: { top: 50, left: 50 }, desktop: { top: 52, left: 40 } }
}
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
  const handleResize = () => setIsMobile(window.innerWidth < 640)
  handleResize() // Run immediately on mount
  window.addEventListener("resize", handleResize)
  return () => window.removeEventListener("resize", handleResize)
}, [])

  const [ipGhostActive, setIpGhostActive] = useState(false)
  const [ipGhostStyle, setIpGhostStyle] = useState<CSSProperties>({})
  const [ipPinned, setIpPinned] = useState(false)
  const [stayDone, setStayDone] = useState(false);       // "Stay vigilant..." finished
  const [showBottom, setShowBottom] = useState(false); // start bottom banner after line 2   // "Stay vigilant..." finished
const [trustStart, setTrustStart] = useState(false); // begin "Trust no one"
const TERMINAL_FADE_MS = 1000;                       // matches transition-opacity duration-1000


  // 🎚 Master timing control
  const TIMING = {
  // existing…
  fadeIn: 2000,
  fadeOut: 2000,

  // ✨ pulse + sequence control
  pulseDelay: 150,      // after IP centers, wait a beat, then pulse
  pulseDuration: 700,   // how long the pulse lasts (shield “bright”)

  // we won’t use fadeOutStart anymore; fade follows pulse end
  // fadeOutStart: 1000, // ← remove or ignore

  // keep these if you still want the earlier dim flow elsewhere, but
  // set disableDim: true so they don’t interfere with pulse here:
  dimStart: 100,
  dimDuration: 800,
  brightenStart: 1500 as number | null,

  ipPrintDelay: 1000,   // (unchanged)
  headerDelay: 300,     // time after header appears before the IP flies
  headerFlyDuration: 650,

  disableDim: true,     // ← prevent the dim/bright effect from overlapping the pulse
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
  }, [verified])

  // 💡 Dim/Bright control synced to IP
  useEffect(() => {
    if (!showIPAddress || TIMING.disableDim) return
    if (TIMING.dimStart !== null) schedule(TIMING.dimStart, () => setShieldBrightness("dim"))
    if (TIMING.brightenStart !== null) schedule(TIMING.brightenStart, () => setShieldBrightness("bright"))
  }, [showIPAddress])

  // ✈️ IP → Header dynamic flight (mobile-safe)
  useEffect(() => {
    if (!showHeader || !showIPAddress || !ip) return

    const run = () => {
      const src = ipSourceRef.current
      const dst = ipTargetRef.current
      if (!src || !dst) {
        setIpPinned(true)
        return
      }

      // 🔧 Force reflow for mobile
      dst.getBoundingClientRect()
      requestAnimationFrame(() => {
        const s = src.getBoundingClientRect()
        const d = dst.getBoundingClientRect()
        if (!s.width || !d.width) {
          setIpPinned(true)
          return
        }

        const baseStyle: CSSProperties = {
          position: "fixed",
          left: `${s.left}px`,
          top: `${s.top}px`,
          width: `${s.width}px`,
          height: `${s.height}px`,
          lineHeight: "1",
          zIndex: 70,
          transform: "translate(0, 0) scale(1)",
          transition: `transform ${TIMING.headerFlyDuration}ms ease-in-out, opacity ${TIMING.headerFlyDuration}ms ease-in-out`,
          color: "#22c55e",
          fontWeight: 600,
          fontFamily: "ui-monospace, Menlo, Monaco, Consolas, monospace",
          whiteSpace: "nowrap",
          overflow: "hidden",
        }

        setIpGhostStyle(baseStyle)
        setIpGhostActive(true)

        // One more frame for layout settle
        requestAnimationFrame(() => {
          const s2 = src.getBoundingClientRect()
          const d2 = dst.getBoundingClientRect()
          const dx = d2.left - s2.left
          const dy = d2.top - s2.top
          const sx = d2.width / s2.width
          const sy = d2.height / s2.height

          setIpGhostStyle((prev) => ({
            ...prev,
            transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`,
          }))
        })

        schedule(TIMING.headerFlyDuration + 60, () => {
          setIpPinned(true)
          setIpGhostActive(false)
        })
      })
    }

    // small delay to ensure header is painted
    schedule(TIMING.headerDelay + 150, run)
  }, [showHeader, showIPAddress, ip])

  if (!verified) return null

  // 💬 Terminal intro
  const lines = [
    { text: "Welcome to the Zero Trust Vault", className: "text-xs sm:text-base text-green-400" },
    { text: "All actions are being monitored", className: "text-xs sm:text-base text-green-400" },
  ]

  // 🎬 Terminal sequence
  const handleSceneDone = () => {
    setShowVigilant(true)
    setTimeout(() => {
      setShowTrust(true)
      setTimeout(() => {
        setFadeOut(true)
        setTimeout(() => setShowIP(true), 1500)
      }, 3500)
    }, 2500)
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

{/* 💻 Terminal intro (no jump, cinematic pacing, glitch-free) */}
{!showIP && shieldFullyVisible && (
  <div
    className={`relative flex flex-col items-center justify-center w-full max-w-[90vw] sm:max-w-2xl transition-opacity duration-1000 ${
      fadeOut ? "opacity-0" : "opacity-100"
    }`}
    style={{ zIndex: 10 }}
  >
    {/* Two fixed-width lines; pre-allocated height prevents jumping */}
    <div
      className="flex flex-col items-center gap-[0.25rem] sm:gap-[0.4rem] text-green-400"
      style={{
        fontFamily: "ui-monospace, Menlo, Monaco, Consolas, monospace",
        whiteSpace: "pre",
        textAlign: "left",
        lineHeight: "1.4em", // ⛓ locks height across both lines
      }}
    >
      {/* Line 1 */}
      <span
        className="inline-block text-xs sm:text-base align-top"
        style={{
          width: `${"Welcome to the Zero Trust Vault".length}ch`,
          minHeight: "1.4em", // ⛓ ensures vertical space stays constant
        }}
      >
        <Typewriter
          text="Welcome to the Zero Trust Vault"
          speed={90}
          cursor
          onComplete={() => setTimeout(() => setShowVigilant(true), 500)} // pause before next line
        />
      </span>

      {/* Line 2 — placeholder is full height & width before printing */}
      <span
        className="inline-block text-xs sm:text-base align-top"
        style={{
          width: `${"All actions are being monitored".length}ch`,
          minHeight: "1.4em", // ⛓ reserve space from start
        }}
      >
        {showVigilant ? (
          <Typewriter
            text="All actions are being monitored"
            speed={90}
            cursor={false}
            onComplete={() => setTimeout(() => setShowBottom(true), 700)} // pause before bottom banner
          />
        ) : (
          <span style={{ visibility: "hidden" }}>All actions are being monitored</span>
        )}
      </span>
    </div>

    {/* 🧠 Bottom banner — same as before, no change */}
    {showBottom && (
      <div
        className="fixed bottom-[25%] left-1/2 -translate-x-1/2 z-40 text-xs sm:text-base"
        style={{
          whiteSpace: "nowrap",
          fontFamily: "ui-monospace, Menlo, Monaco, Consolas, monospace",
          color: "rgb(34 197 94)",
        }}
      >
        {/* 1️⃣ Stay vigilant... */}
        <span
          className="inline-block"
          style={{ width: `${STAY.length}ch`, textAlign: "left" }}
        >
          <Typewriter
            text={STAY}
            speed={90}
            cursor={!stayDone}
            onComplete={() => {
              setStayDone(true)
              setTimeout(() => setTrustStart(true), 800) // pause before Trust
            }}
          />
        </span>

        {/* Spacer */}
        <span className="inline-block" style={{ width: "2ch" }} />

        {/* 2️⃣ Trust no one */}
        <span
          className="inline-block text-red-500"
          style={{ width: `${TRUST.length}ch`, textAlign: "left" }}
        >
          {trustStart ? (
            <Typewriter
              text={TRUST}
              speed={90}
              cursor
              onComplete={() => {
                setFadeOut(true)
                setTimeout(() => setShowIP(true), TERMINAL_FADE_MS + 50)
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

 {/* 🌐 IP cinematic sequence — dynamic travel (bottom → center → header) */}
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
      transform: moveIPToCenter
        ? "translate(-50%, -50%)"
        : "translate(-50%, 0)",
      fontFamily: "ui-monospace, Menlo, Monaco, Consolas, monospace",
      whiteSpace: "nowrap",
      textAlign: "left",
    }}
  >
    {isMobile ? (
      /* 📱 Mobile: IP prints under the line */
      <div className="flex flex-col items-center">
        {/* Prefix — fades out; IP stays */}
        <span
          id="ip-line"
          className={`text-green-400 transition-opacity duration-700 ${
            fadeIPLine ? "opacity-0" : "opacity-100"
          }`}
          style={{ display: "inline-block", width: `${PREFIX.length}ch` }}
        >
          <Typewriter
            text={PREFIX}
            speed={45}
            cursor={false}
            onComplete={() => setTimeout(() => setShowIPAddress(true), 800)}
          />
        </span>

        {/* IP below the line (no fade) */}
        <span
          ref={ipSourceRef}
          id="ip-address"
          className="text-green-500 font-semibold overflow-hidden truncate mt-2 text-xs sm:text-base"
          style={{
            display: "inline-block",
            width: `${Math.max((ip ?? "").length, 15)}ch`, // reserve width; no shift
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
              onComplete={() => {
                // Prefix fades (IP stays visible)
                setFadeIPLine(true);

                // Then move → pulse → fade shield → header → fly to header
                setTimeout(() => {
                  setMoveIPToCenter(true);

                  setTimeout(() => {
                    setShieldBrightness("bright"); // pulse

                    setTimeout(() => {
                      setShieldBrightness("normal");
                      setShieldVisible(false); // fade shield

                      setTimeout(() => {
                        setShowHeader(true);

                        setTimeout(() => {
                          setMoveIPToHeader(true);
                        }, TIMING.headerDelay);
                      }, TIMING.fadeOut);
                    }, TIMING.pulseDuration);
                  }, TIMING.pulseDelay);
                }, TIMING.ipPrintDelay);
              }}
            />
          ) : (
            <span style={{ visibility: "hidden" }}>000.000.000.000</span>
          )}
        </span>
      </div>
    ) : (
      /* 💻 Desktop: IP stays inline with the line */
      <div className="flex items-baseline justify-center" style={{ whiteSpace: "pre" }}>
        {/* Prefix — fades out, keeps width */}
        <span
          id="ip-line"
          className={`text-green-400 transition-opacity duration-700 ${
            fadeIPLine ? "opacity-0" : "opacity-100"
          }`}
          style={{ display: "inline-block", width: `${PREFIX.length}ch` }}
        >
          <Typewriter
            text={PREFIX}
            speed={45}
            cursor={false}
            onComplete={() => setTimeout(() => setShowIPAddress(true), 800)}
          />
        </span>

        {/* one space between prefix and IP */}
        <span>&nbsp;</span>

        {/* IP inline (no fade) */}
        <span
          ref={ipSourceRef}
          id="ip-address"
          className="text-green-500 font-semibold overflow-hidden truncate text-xs sm:text-base"
          style={{
            display: "inline-block",
            width: `${Math.max((ip ?? "").length, 15)}ch`, // reserve width; no shift
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
              onComplete={() => {
                setFadeIPLine(true);

                setTimeout(() => {
                  setMoveIPToCenter(true);

                  setTimeout(() => {
                    setShieldBrightness("bright");

                    setTimeout(() => {
                      setShieldBrightness("normal");
                      setShieldVisible(false);

                      setTimeout(() => {
                        setShowHeader(true);

                        setTimeout(() => {
                          setMoveIPToHeader(true);
                        }, TIMING.headerDelay);
                      }, TIMING.fadeOut);
                    }, TIMING.pulseDuration);
                  }, TIMING.pulseDelay);
                }, TIMING.ipPrintDelay);
              }}
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
  </div>
)}