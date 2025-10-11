"use client"

import { useEffect, useMemo, useState } from "react"
import { Typewriter } from "@/components/ui/typewriter"

type Line = {
  text: string
  speed?: number
  className?: string
  cursor?: boolean
  delay?: number
}

export interface TerminalSceneProps {
  lines: Line[]
  containerClassName?: string
  lineGapClass?: string
  onDone?: () => void
  speed?: number
  lineDelay?: number
  lineHeight?: number
  fadeNonPinned?: boolean
  fadeDelay?: number
}

export function TerminalScene({
  lines,
  containerClassName = "",
  lineGapClass = "gap-2",
  onDone,
  speed = 45,
  lineDelay = 250,
  lineHeight = 28,
  fadeNonPinned = false,
  fadeDelay = 1000,
}: TerminalSceneProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [locked, setLocked] = useState(false)

  const normalized = useMemo(
    () =>
      lines.map((l) => ({
        text: l.text ?? "",
        speed: l.speed ?? speed,
        className: l.className ?? "",
        cursor: l.cursor ?? true,
        delay: l.delay ?? lineDelay,
      })),
    [lines, speed, lineDelay],
  )

  useEffect(() => {
    if (normalized.length === 0 || locked) return
    let cancelled = false
    const timers: number[] = []

    const run = (i: number) => {
      if (cancelled || locked) return
      if (i >= normalized.length) {
        setLocked(true)
        onDone?.()
        return
      }

      setActiveIndex(i)
      const line = normalized[i]
      const duration = line.text.length * line.speed + line.delay
      const t = window.setTimeout(() => run(i + 1), duration)
      timers.push(t)
    }

    run(0)
    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
  }, [normalized, onDone, locked])

  const containerClasses = `w-full ${containerClassName}`
  const flexClasses = `flex flex-col ${lineGapClass}`

  return (
    <div className={containerClasses}>
      <div className={flexClasses} style={{ lineHeight: `${lineHeight}px` }}>
        {normalized.map((line, idx) => {
          const isPast = idx < activeIndex
          const isCurrent = idx === activeIndex
          const opacityClass = fadeNonPinned && isPast ? "opacity-60" : "opacity-100"
          const lineClasses = `transition-opacity duration-700 ${opacityClass} ${line.className}`

          return (
            <div
              key={idx}
              className={lineClasses}
              style={{ lineHeight: `${lineHeight}px`, minHeight: `${lineHeight}px` }}
            >
              {isPast ? (
                <span className="whitespace-pre">{line.text}</span>
              ) : isCurrent ? (
                <Typewriter text={line.text} speed={line.speed} className="whitespace-pre" cursor={line.cursor} />
              ) : (
                <span className="opacity-0 whitespace-pre">{line.text || " "}</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default TerminalScene
