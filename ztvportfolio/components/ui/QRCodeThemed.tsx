"use client"

import React, { useEffect, useState } from "react"
import { QRCodeCanvas } from "qrcode.react"

export function QRCodeThemed({ value }: { value: string }) {
  const [accentColor, setAccentColor] = useState("#00ff66")

  // Pull current theme accent dynamically from Tailwind CSS vars
  useEffect(() => {
    const root = getComputedStyle(document.documentElement)
    const green = root.getPropertyValue("--green-400").trim() || "#00ff66"
    setAccentColor(green)
  }, [])

  const fgColor = accentColor
  const bgColor = "#000000"

  return (
    <div
      className="p-5 rounded-2xl flex justify-center items-center bg-black
                 border transition-transform duration-300 hover:scale-105"
      style={{
        borderColor: `${accentColor}80`,
        boxShadow: `0 0 20px ${accentColor}33`,
      }}
    >
      <QRCodeCanvas
        value={value}
        size={240}
        level="H"
        fgColor={fgColor}
        bgColor={bgColor}
        style={{
          borderRadius: "12px",
          padding: "8px", // replaces includeMargin
          backgroundColor: bgColor,
        }}
      />
    </div>
  )
}