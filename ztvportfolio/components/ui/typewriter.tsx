"use client"

import { useEffect, useState } from "react"

interface TypewriterProps {
  text: string
  speed?: number
  className?: string
  cursor?: boolean
  onComplete?: () => void
}

export function Typewriter({
  text,
  speed = 50,
  className = "",
  cursor = true,
  onComplete,
}: TypewriterProps) {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showCursor, setShowCursor] = useState(true)
  const [cursorActive, setCursorActive] = useState(cursor)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, speed)
      return () => clearTimeout(timeout)
    } else if (currentIndex === text.length) {
      // stop cursor when typing completes
      setCursorActive(false)
      onComplete?.()
    }
  }, [currentIndex, text, speed, onComplete])

  useEffect(() => {
    if (!cursorActive) return
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 530)
    return () => clearInterval(cursorInterval)
  }, [cursorActive])

  return (
    <span className={className}>
      {displayedText}
      {cursorActive && (
        <span
          className={`inline-block w-2 h-4 bg-green-400 ml-1 ${
            showCursor ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </span>
  )
}