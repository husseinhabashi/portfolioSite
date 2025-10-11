"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, BriefcaseBusiness } from "lucide-react"

type Role = {
  company: string
  title: string
  period: string
  bullets: string[]
}

const roles: Role[] = [
  {
    company: "ZTV Portfolio",
    title: "Creator / Full-Stack Engineer",
    period: "2025 — Present",
    bullets: [
      "Built a zero-trust cinematic onboarding with session & IP verification.",
      "Implemented FLIP animation to dock session IP into header.",
      "Designed audit, leak tracking, and session lifecycle endpoints.",
    ],
  },
  {
    company: "Security-Focused Apps",
    title: "Frontend/Platform Engineer",
    period: "2023 — 2025",
    bullets: [
      "Hardened auth flows with token rotation and tamper-aware storage.",
      "Shipped DX tooling (PNPM workspaces, CI/CD) and motion guidelines.",
    ],
  },
]

const item = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0 },
}

export default function ExperiencePage() {
  return (
    <div className="relative min-h-screen bg-black text-green-400 font-mono overflow-hidden">
      <div className="cyber-grid" />

      <header className="container mx-auto max-w-4xl px-4 pt-8 pb-4">
        <Link href="/main?fastload=true" className="inline-flex items-center gap-2 text-green-300/80 hover:text-green-300 transition">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="mt-6 flex items-center gap-3">
          <BriefcaseBusiness className="h-5 w-5 text-green-400" />
          <h1 className="text-xl sm:text-2xl font-bold tracking-wide">Experience</h1>
        </div>
        <p className="mt-2 text-xs sm:text-sm text-green-300/80">
          Highlights of recent work and responsibilities.
        </p>
      </header>

      <main className="container mx-auto max-w-4xl px-4 pb-16">
        <div className="relative pl-6 border-l-2 border-green-800/60">
          {roles.map((r, idx) => (
            <motion.section
              key={r.company + idx}
              variants={item}
              initial="hidden"
              animate="show"
              transition={{ delay: idx * 0.08 }}
              className="relative mb-8"
            >
              <div className="absolute -left-[18px] top-1 h-3 w-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(0,255,0,0.6)]" />
              <h2 className="text-sm sm:text-base font-semibold">{r.title}</h2>
              <div className="text-[11px] sm:text-xs text-green-300/80">
                {r.company} • {r.period}
              </div>
              <ul className="mt-3 space-y-1.5 text-[12px] sm:text-sm text-green-300/90">
                {r.bullets.map((b, i) => (
                  <li key={i} className="leading-relaxed">• {b}</li>
                ))}
              </ul>
            </motion.section>
          ))}
        </div>
      </main>
    </div>
  )
}