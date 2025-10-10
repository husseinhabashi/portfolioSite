"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Lock, Fingerprint, Eye, Terminal, Database, AlertTriangle } from "lucide-react"
import { SessionFingerprintDisplay } from "@/components/session-fingerprint-display"
import { SessionWatermark } from "@/components/session-watermark"
import { TrackingPixel } from "@/components/tracking-pixel"
import { SecurityControls } from "@/components/security-controls"

export default function HomePage() {
  const [ip, setIp] = useState<string | null>(null)

  // 🔍 Fetch IP on load
  useEffect(() => {
    fetch("/api/ip")
      .then((res) => res.json())
      .then((data) => {
        console.log("📡 IP saved:", data.ip)
        setIp(data.ip)
      })
      .catch((err) => console.error("❌ IP log failed:", err))
  }, [])
  
  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      <SecurityControls />
      <SessionWatermark />
      <TrackingPixel />

      {/* Header */}
      <header className="border-b border-green-800">
  <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
    {/* Logo + Title */}
    <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
      <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-green-400 shrink-0" />
      <span className="font-bold text-lg sm:text-xl text-center sm:text-left">
        Zero Trust Vault
      </span>
    </div>

    {/* Navigation */}
    <nav className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-4 w-full sm:w-auto">
      <Link href="/security">
        <Button
          variant="ghost"
          size="sm"
          className="text-green-400 hover:text-black hover:bg-green-400 w-full sm:w-auto"
        >
          Security
        </Button>
      </Link>

      <Link href="/admin">
        <Button
          variant="ghost"
          size="sm"
          className="text-green-400 hover:text-black hover:bg-green-400 w-full sm:w-auto"
        >
          Admin
        </Button>
      </Link>

      <Link href="/invite">
        <Button
          variant="ghost"
          size="sm"
          className="text-green-400 hover:text-black hover:bg-green-400 w-full sm:w-auto"
        >
          Invite
        </Button>
      </Link>
    </nav>
  </div>
</header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-16 md:py-24 text-center space-y-6">
        <Badge variant="outline" className="gap-2 border-green-400 text-green-400">
          <Lock className="h-3 w-3" />
          Cryptographically Secured Access
        </Badge>

        <h1 className="text-5xl md:text-6xl font-bold">Advanced Cybersecurity Engineering Portfolio</h1>

        <p className="text-xl text-green-300">
          Invite-only portal demonstrating enterprise-grade security engineering:
          <br /> cryptographic authentication, session fingerprinting, IP binding, and leak tracking.
        </p>

        <p className="text-red-500 text-lg font-bold animate-pulse flex flex-col items-center justify-center gap-2 mt-4">
          <span className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" /> ⚠️ Your IP is being tracked...
          </span>
          {ip && (
            <span className="text-green-300 text-sm">
              📡 Your current IP: <span className="font-bold">{ip}</span>
            </span>
          )}
        </p>

        <div className="flex flex-wrap gap-3 justify-center pt-6">
          <Link href="/security">
            <Button size="lg" className="bg-green-400 text-black hover:bg-green-300 gap-2">
              <Eye className="h-4 w-4" /> View Security Architecture
            </Button>
          </Link>
        </div>
      </section>

      {/* Security Features */}
      <section className="container mx-auto px-4 py-16 border-t border-green-800">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Security Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Lock,
                title: "Cryptographic Invites",
                desc: "SHA-256 hashing with ECDSA digital signatures. Access requires valid signature verification.",
              },
              {
                icon: Fingerprint,
                title: "Session Fingerprinting",
                desc: "Every session generates a unique SHA-256 fingerprint for full audit logging.",
              },
              {
                icon: Shield,
                title: "IP Binding",
                desc: "Invites are bound to the first IP address used. Different IPs are denied.",
              },
              {
                icon: Eye,
                title: "Leak Tracking",
                desc: "Canary tokens and watermarking trace leaked content back to its source.",
              },
              {
                icon: Terminal,
                title: "Signature-Based Admin",
                desc: "Zero-password admin access via ECDSA challenge-response.",
              },
              {
                icon: Database,
                title: "Comprehensive Auditing",
                desc: "All access attempts and violations are logged with full forensic context.",
              },
            ].map(({ icon: Icon, title, desc }, i) => (
              <Card key={i} className="bg-black border-green-700">
                <CardHeader>
                  <div className="p-2 bg-green-900/20 rounded-lg w-fit mb-2">
                    <Icon className="h-5 w-5 text-green-400" />
                  </div>
                  <CardTitle>{title}</CardTitle>
                  <CardDescription>{desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-green-800 mt-16 py-6 text-green-400">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm">
            Secure Portfolio — Demonstrating Advanced Cybersecurity Engineering
          </p>
          <SessionFingerprintDisplay />
        </div>
      </footer>
    </div>
  )
}