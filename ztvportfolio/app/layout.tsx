import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Zero Trust Vault",
  description: "Invite-only cryptographically secured portfolio",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-green-400 font-mono selection:bg-green-500 selection:text-black`}
      >
        {/* Global Hacker Overlay */}
        <div className="fixed top-0 left-0 w-full bg-green-500/10 text-center text-xs py-1 tracking-widest z-50 font-bold border-b border-green-700">
          ⚡ Your IP Address Is Already Marked :) ⚡
        </div>

        {children}

        {/* Subtle grid overlay for hacker vibe */}
        <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(0,255,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
      </body>
    </html>
  )
}