"use client"
import { useState, useEffect } from "react"

interface TypewriterProps {
  text: string
  speed?: number // ms per character
  className?: string
}

export function Typewriter({ text, speed = 50, className }: TypewriterProps) {
  const [displayed, setDisplayed] = useState("")

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1))
      i++
      if (i === text.length) clearInterval(interval)
    }, speed)
    return () => clearInterval(interval)
  }, [text, speed])

  return <p className={className}>{displayed}</p>
}