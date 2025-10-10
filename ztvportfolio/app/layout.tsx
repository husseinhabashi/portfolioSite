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

        {/* ✅ Push content down so banner doesn’t overlap */}
        <div className="pt-6">
          {children}
        </div>

        {/* ✅ Subtle grid overlay for hacker vibe */}
        <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(0,255,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
      </body>
    </html>
  )
}