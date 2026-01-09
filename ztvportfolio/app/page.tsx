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
  ChevronDown,
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

  const scrollToAbout = () => {
    document.querySelector("#about")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <main className="relative min-h-screen bg-background text-foreground overflow-hidden">
      {/* Security Layers */}
      <SecurityControls />
      <SessionWatermark />
      <TrackingPixel />

      {/* Background Glow */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,102,0.06),transparent_70%)]" />
      </div>

      {/* HEADER */}
      <header className="fixed top-0 left-0 w-full z-50 bg-background/70 backdrop-blur-md border-b border-border">
        <div className="container mx-auto max-w-6xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-[var(--primary)]" />
            <span className="font-bold text-lg sm:text-xl text-foreground tracking-wide">
              ZeroTrustVault
            </span>
          </div>

          <nav className="flex flex-wrap justify-center sm:justify-end gap-3">
            <Link href="/invite">
              <Button
                size="sm"
                className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:brightness-110 font-semibold flex items-center gap-1"
              >
                <KeyRound className="h-4 w-4" /> Access Portfolio
              </Button>
            </Link>
            <Link href="/security">
              <Button
                variant="ghost"
                size="sm"
                className="text-foreground hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] font-semibold"
              >
                Security
              </Button>
            </Link>
            <Link href="/admin">
              <Button
                variant="ghost"
                size="sm"
                className="text-foreground hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] font-semibold"
              >
                Admin
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="relative flex flex-col items-center justify-center min-h-screen text-center px-6 pt-32">
        {/* ✅ Right-side scroll cue (above the fold, always visible) */}
        <motion.button
          type="button"
          aria-label="Scroll to learn more"
          onClick={scrollToAbout}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9, duration: 0.8, ease: "easeOut" }}
          className="
            fixed
            right-6
            top-1/2
            -translate-y-1/2
            z-50
            group
            flex
            items-center
            gap-3
            rounded-full
            border
            border-indigo-600/60
            bg-black/40
            backdrop-blur
            px-4
            py-3
            text-indigo-300
            hover:text-white
            hover:bg-indigo-800/20
            transition
          "
          style={{ boxShadow: "0 0 14px rgba(99,102,241,0.25)" }}
        >
          <span className="text-[11px] tracking-[0.25em] uppercase">More</span>
          <ChevronDown className="h-5 w-5 animate-bounce text-indigo-300 group-hover:text-white" />
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <Badge variant="outline" className="border-border text-foreground">
            <Cpu className="h-3 w-3 mr-1" /> System Status: Online
          </Badge>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="text-6xl md:text-7xl font-bold text-foreground"
          >
            Hussein Habashi
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="text-2xl md:text-3xl text-[var(--muted-foreground)] font-light"
          >
            Cybersecurity Engineer • SOC Analyst • AI-Driven Security Innovator
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1.2 }}
            className="text-[var(--muted-foreground)] max-w-2xl mx-auto leading-relaxed font-light text-lg"
          >
            Welcome to <span className="text-[var(--primary)] font-semibold">ZeroTrustVault</span> — a
            live, cryptographically secured cybersecurity portfolio that merges engineering,
            forensics, and AI-assisted defense.
            <br />
            <br />
            All portfolio content is gated for security and can be accessed exclusively through the{" "}
            <strong className="text-[var(--primary)] underline underline-offset-4">Invite Portal</strong>{" "}
            below.
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
                className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:brightness-110 px-10 py-7 text-lg font-semibold rounded-xl"
              >
                <KeyRound className="h-5 w-5 mr-2" /> Access Portfolio
              </Button>
            </Link>
            <p className="text-[var(--muted-foreground)] mt-3 text-sm">
              (Use the <span className="font-semibold text-[var(--primary)]">Invite Portal</span> to
              access the full portfolio. Universal credentials are displayed there.)
            </p>
          </motion.div>

          {/* Nova Console */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 1 }}
            className="mt-12 text-sm text-foreground/90 font-light flex items-center gap-2 justify-center"
          >
            <Bot className="h-4 w-4 text-[var(--primary)]" />
            <span>Nova: Online • Ready to guide you through the vault</span>
          </motion.div>

          {/* IP Tracking */}
          {ip && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 1 }}
              className="mt-6 text-[var(--destructive)] text-lg font-bold animate-pulse flex flex-col items-center gap-2"
            >
              <span className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" /> Active Session Detected
              </span>
              <span className="text-[var(--muted-foreground)] text-sm">
                Your IP: <span className="font-bold">{ip}</span>
              </span>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* ABOUT SECTION */}
      <section
        id="about"
        className="container mx-auto max-w-5xl px-6 py-28 text-center space-y-8 border-t border-border/40"
      >
        <h2 className="text-4xl font-bold text-[var(--primary)]">Inside the Vault</h2>
        <p className="text-[var(--muted-foreground)] font-light leading-relaxed text-lg max-w-3xl mx-auto">
          ZeroTrustVault is not a static website — it’s a functioning cybersecurity environment.
          Each component (from invite signatures to IP binding) mirrors real-world enterprise
          security design.
          <br />
          <br />
          Accessing the portfolio through the{" "}
          <strong className="text-[var(--primary)] underline underline-offset-4">Invite Portal</strong>{" "}
          allows you to explore interactive projects, detection systems, and AI-driven red and blue
          team demonstrations — all explained by{" "}
          <span className="text-[var(--primary)] font-semibold">Nova</span>, my personal AI assistant.
        </p>
      </section>

      {/* FEATURES GRID */}
      <section className="relative border-t border-border/40 py-28">
        <div className="absolute inset-0 bg-background" />
        <div className="container mx-auto max-w-6xl px-6 relative z-10">
          <h2 className="text-3xl font-bold text-center text-[var(--primary)] mb-14">
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
                <Card className="bg-[var(--card)] border border-[var(--border)] transition-all duration-300 rounded-xl">
                  <CardHeader>
                    <div className="p-3 bg-[var(--secondary)] rounded-lg w-fit mb-3">
                      <Icon className="h-6 w-6 text-[var(--primary)]" />
                    </div>
                    <CardTitle className="text-foreground">{title}</CardTitle>
                    <CardDescription className="text-[var(--muted-foreground)] font-light leading-relaxed">
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
      <footer className="border-t border-border py-10 text-foreground bg-background">
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