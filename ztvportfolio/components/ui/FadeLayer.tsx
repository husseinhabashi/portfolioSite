"use client"

import type { ReactNode } from "react"

interface FadeLayerProps {
  visible: boolean
  duration?: number
  children: ReactNode
}

export default function FadeLayer({ visible, duration = 1000, children }: FadeLayerProps) {
  return (
    <div
      className={`fixed inset-0 transition-opacity ease-in-out ${
        visible ? "pointer-events-auto" : "pointer-events-none"
      }`}
      style={{
        opacity: visible ? 1 : 0,
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  )
}
