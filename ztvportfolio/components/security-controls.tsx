"use client"

import { useEffect } from "react"

export function SecurityControls() {
  useEffect(() => {
    // Get session fingerprint for logging
    let sessionFingerprint = "unknown"
    fetch("/api/session/info")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          sessionFingerprint = data.session.fingerprint
        }
      })
      .catch(() => {})

    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      console.log("[v0] Right-click disabled for security")
      logSecurityEvent("right_click_attempted", sessionFingerprint)
      return false
    }

    // Disable text selection
    const handleSelectStart = (e: Event) => {
      e.preventDefault()
      return false
    }

    // Intercept copy events and append session signature
    const handleCopy = (e: ClipboardEvent) => {
      const selection = window.getSelection()?.toString()
      if (selection) {
        const watermarkedText = `${selection}\n\n[Session: ${sessionFingerprint.substring(0, 16)}... | Timestamp: ${new Date().toISOString()}]`
        e.clipboardData?.setData("text/plain", watermarkedText)
        e.preventDefault()
        console.log("[v0] Copy event intercepted - session signature appended")
        logSecurityEvent("copy_attempted", sessionFingerprint)
      }
    }

    // Detect DevTools opening
    let devtoolsOpen = false
    const detectDevTools = () => {
      const threshold = 160
      const widthThreshold = window.outerWidth - window.innerWidth > threshold
      const heightThreshold = window.outerHeight - window.innerHeight > threshold

      if ((widthThreshold || heightThreshold) && !devtoolsOpen) {
        devtoolsOpen = true
        console.log("[v0] DevTools detected - logging security event")
        logSecurityEvent("devtools_opened", sessionFingerprint)
      } else if (!widthThreshold && !heightThreshold && devtoolsOpen) {
        devtoolsOpen = false
      }
    }

    // Detect headless browsers
    const detectHeadless = () => {
      // Check for common headless browser indicators
      const isHeadless =
        /HeadlessChrome/.test(navigator.userAgent) ||
        !navigator.webdriver === false ||
        (navigator as any).plugins?.length === 0

      if (isHeadless) {
        console.log("[v0] Headless browser detected")
        logSecurityEvent("headless_browser_detected", sessionFingerprint)
      }
    }

    // Detect debugger
    const detectDebugger = () => {
      const start = performance.now()
      // debugger statement will pause execution if DevTools is open
      // eslint-disable-next-line no-debugger
      debugger
      const end = performance.now()

      // If execution was paused for more than 100ms, DevTools is likely open
      if (end - start > 100) {
        console.log("[v0] Debugger detected")
        logSecurityEvent("debugger_detected", sessionFingerprint)
      }
    }

    // Log security events to server
    const logSecurityEvent = async (eventType: string, fingerprint: string) => {
      try {
        await fetch("/api/security/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventType,
            fingerprint,
            timestamp: Date.now(),
          }),
        })
      } catch (error) {
        console.error("[v0] Failed to log security event:", error)
      }
    }

    // Add event listeners
    document.addEventListener("contextmenu", handleContextMenu)
    document.addEventListener("selectstart", handleSelectStart)
    document.addEventListener("copy", handleCopy)

    // Run detection checks
    detectHeadless()
    const devToolsInterval = setInterval(detectDevTools, 1000)
    const debuggerInterval = setInterval(detectDebugger, 5000)

    // Cleanup
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu)
      document.removeEventListener("selectstart", handleSelectStart)
      document.removeEventListener("copy", handleCopy)
      clearInterval(devToolsInterval)
      clearInterval(debuggerInterval)
    }
  }, [])

  return null // This component doesn't render anything
}
