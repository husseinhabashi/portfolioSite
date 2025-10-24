"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Shield,
  Lock,
  Fingerprint,
  Eye,
  Terminal,
  Database,
  AlertTriangle,
  KeyRound,
  Bot,
  Cpu,
} from "lucide-react"
import { SessionFingerprintDisplay } from "@/components/session-fingerprint-display"
import { SessionWatermark } from "@/components/session-watermark"
import { TrackingPixel } from "@/components/tracking-pixel"
import { SecurityControls } from "@/components/security-controls"

export default function HomePage() {
  const [ip, setIp] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/ip")
      .then((res) => res.json())
      .then((data) => setIp(data.ip))
      .catch(() => {})
  }, [])

  return (
    <main className="relative min-h-screen text-green-400 overflow-hidden">
      {/* Security Layers */}
      <SecurityControls />
      <SessionWatermark />
      <TrackingPixel />

      {/* Background Glow (no dense grid) */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-green-950/15 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,100,0.06),transparent_70%)]" />
      </div>

      {/* HEADER */}
      <header className="fixed top-0 left-0 w-full z-50 bg-black/70 backdrop-blur-md border-b border-green-800">
        <div className="container mx-auto max-w-6xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-green-400" />
            <span className="font-bold text-lg sm:text-xl text-green-400 tracking-wide">
              ZeroTrustVault
            </span>
          </div>

          <nav className="flex flex-wrap justify-center sm:justify-end gap-3">
            <Link href="/invite">
              <Button
                size="sm"
                className="bg-green-400 text-black hover:bg-green-300 font-semibold flex items-center gap-1"
              >
                <KeyRound className="h-4 w-4" /> Access Portfolio
              </Button>
            </Link>
            <Link href="/security">
              <Button
                variant="ghost"
                size="sm"
                className="text-green-400 hover:bg-green-400 hover:text-black font-semibold"
              >
                Security
              </Button>
            </Link>
            <Link href="/admin">
              <Button
                variant="ghost"
                size="sm"
                className="text-green-400 hover:bg-green-400 hover:text-black font-semibold"
              >
                Admin
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="flex flex-col items-center justify-center min-h-screen text-center px-6 pt-32">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <Badge variant="outline" className="border-green-400 text-green-400">
            <Cpu className="h-3 w-3 mr-1" /> System Status: Online
          </Badge>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="text-6xl md:text-7xl font-bold text-green-400 drop-shadow-[0_0_12px_rgba(0,255,0,0.3)]"
          >
            Hussein Habashi
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="text-2xl md:text-3xl text-green-300 font-light"
          >
            Cybersecurity Engineer • SOC Analyst • AI-Driven Security Innovator
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1.2 }}
            className="text-green-200 max-w-2xl mx-auto leading-relaxed font-light text-lg"
          >
            Welcome to <span className="text-green-400 font-semibold">ZeroTrustVault</span> — a
            live, cryptographically secured cybersecurity portfolio that merges engineering,
            forensics, and AI-assisted defense.
            <br />
            <br />
            All portfolio content is gated for security and can be accessed exclusively through the{" "}
            <strong className="text-green-400 underline underline-offset-4">Invite Portal</strong> below.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 1 }}
            className="pt-10"
          >
            <Link href="/invite">
              <Button
                size="lg"
                className="bg-green-400 text-black hover:bg-green-300 px-10 py-7 text-lg font-semibold rounded-xl shadow-[0_0_20px_rgba(0,255,0,0.3)] hover:scale-105 transition-all duration-300"
              >
                <KeyRound className="h-5 w-5 mr-2" /> Enter Invite Portal
              </Button>
            </Link>
            <p className="text-green-300 mt-3 text-sm">
              (Use the <span className="font-semibold text-green-400">Invite Portal</span> to access the full portfolio.  
              Universal credentials are displayed there.)
            </p>
          </motion.div>

          {/* Nova Console */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 1 }}
            className="mt-12 text-sm text-green-400/90 font-light flex items-center gap-2 justify-center"
          >
            <Bot className="h-4 w-4 animate-pulse" />
            <span>Nova: Online • Ready to guide you through the vault</span>
          </motion.div>

          {/* IP Tracking */}
          {ip && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 1 }}
              className="mt-6 text-red-500 text-lg font-bold animate-pulse flex flex-col items-center gap-2"
            >
              <span className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" /> Active Session Detected
              </span>
              <span className="text-green-300 text-sm">
                Your IP: <span className="font-bold">{ip}</span>
              </span>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* ABOUT SECTION */}
      <section className="container mx-auto max-w-5xl px-6 py-28 text-center space-y-8 border-t border-green-800/40">
        <h2 className="text-4xl font-bold text-green-400">Inside the Vault</h2>
        <p className="text-green-300 font-light leading-relaxed text-lg max-w-3xl mx-auto">
          ZeroTrustVault is not a static website — it’s a functioning cybersecurity environment.
          Each component (from invite signatures to IP binding) mirrors real-world enterprise
          security design.  
          <br />
          <br />
          Accessing the portfolio through the{" "}
          <strong className="text-green-400 underline underline-offset-4">Invite Portal</strong>{" "}
          allows you to explore interactive projects, detection systems, and AI-driven red and blue
          team demonstrations — all explained by{" "}
          <span className="text-green-400 font-semibold">Nova</span>, my AI assistant.
        </p>
      </section>

      {/* FEATURES GRID */}
      <section className="relative border-t border-green-800/40 py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-green-950/10 to-black" />
        <div className="container mx-auto max-w-6xl px-6 relative z-10">
          <h2 className="text-3xl font-bold text-center text-green-400 mb-14">
            Core Security Framework
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              {
                icon: Lock,
                title: "Cryptographic Invites",
                desc: "SHA-256 + ECDSA validation ensures only verified sessions access the vault.",
              },
              {
                icon: Fingerprint,
                title: "Session Fingerprinting",
                desc: "Each visitor generates a unique session hash for audit integrity.",
              },
              {
                icon: Shield,
                title: "IP Binding",
                desc: "Sessions are tied to the user’s first IP for authenticity and control.",
              },
              {
                icon: Eye,
                title: "Leak Tracking",
                desc: "Canary tokens and embedded watermarks trace unauthorized access.",
              },
              {
                icon: Terminal,
                title: "Signature-Based Admin",
                desc: "Admin access through ECDSA public-key challenge-response.",
              },
              {
                icon: Database,
                title: "Forensic Audit Logs",
                desc: "Every action and event is logged immutably for full traceability.",
              },
            ].map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.8 }}
              >
                <Card className="bg-black/80 border border-green-800 hover:border-green-500/80 transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,255,0,0.2)] rounded-xl">
                  <CardHeader>
                    <div className="p-3 bg-green-900/20 rounded-lg w-fit mb-3">
                      <Icon className="h-6 w-6 text-green-400" />
                    </div>
                    <CardTitle className="text-green-400">{title}</CardTitle>
                    <CardDescription className="text-green-300 font-light leading-relaxed">
                      {desc}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-green-800 py-10 text-green-400">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4 px-6">
          <p className="text-sm text-center md:text-left font-light">
            ZeroTrustVault © {new Date().getFullYear()} — Interactive Cybersecurity Portfolio by Hussein Habashi
          </p>
          <SessionFingerprintDisplay />
        </div>
      </footer>
    </main>
  )
}