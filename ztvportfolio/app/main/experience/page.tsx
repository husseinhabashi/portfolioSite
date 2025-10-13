"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, BriefcaseBusiness } from "lucide-react"

const roles = [
  {
    title: "Community Junior SOC Analyst",
    company: "Level Effect",
    period: "2025 — Present",
    desc: [
      "Tier 1 & 2 SOC operations, alert triage, endpoint investigation, and log analysis.",
      "Authored IR playbooks reducing MTTR by 30%.",
      "Guided SOC100 students, improving lab completion by 25%.",
      "Achieved 95% SLA incident resolution, 90%+ true positive detection rate.",
    ],
  },
  {
    title: "Cybersecurity & Networking Intern",
    company: "Montclair State University",
    period: "2024 — 2025",
    desc: [
      "Conducted vulnerability scans, endpoint hardening, and traffic analysis.",
      "Assisted IT teams with security monitoring and awareness training.",
    ],
  },
  {
    title: "Data Center Operations Technician",
    company: "Montclair State University",
    period: "2023 — 2024",
    desc: [
      "Managed server deployments, diagnostics, and patch cycles.",
      "Improved uptime by 18% and firmware compliance.",
    ],
  },
]

export default function ExperiencePage() {
  const [active, setActive] = useState<any>(null)

  return (
    <div className="relative min-h-screen bg-black text-green-400 font-mono overflow-hidden">
      <div className="cyber-grid" />

      <header className="container mx-auto max-w-4xl px-4 pt-8 pb-4">
        <Link href="/main?fastload=true" className="inline-flex items-center gap-2 text-green-300/80 hover:text-green-300 transition">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>

        <div className="mt-6 flex items-center gap-3">
          <BriefcaseBusiness className="h-5 w-5 text-green-400" />
          <h1 className="text-xl sm:text-2xl font-bold tracking-wide">Experience</h1>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 pb-20">
        {roles.map((r, i) => (
          <motion.div
            key={r.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="border border-green-800/60 bg-black/60 rounded-xl p-4 mb-4"
          >
            <div className="flex justify-between items-start">
              <h2 className="text-sm sm:text-base font-semibold">{r.title}</h2>
              <button onClick={() => setActive(r)} className="text-green-300/80 hover:text-green-200 text-xs">
                Details ▸
              </button>
            </div>
            <p className="text-[11px] sm:text-xs text-green-300/80">{r.company} • {r.period}</p>
          </motion.div>
        ))}
      </main>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 flex items-center justify-center bg-black/70 z-50"
          >
            <div className="bg-black/90 border border-green-800 rounded-xl p-6 w-80 sm:w-96 relative">
              <button onClick={() => setActive(null)} className="absolute top-3 right-3 text-green-400 hover:text-red-400">
                ✕
              </button>
              <h3 className="text-base font-semibold mb-3">{active.title}</h3>
              <p className="text-[12px] text-green-300/80 mb-2">{active.company} • {active.period}</p>
              <ul className="space-y-1 text-[12px] text-green-300/90">
                {active.desc.map((d: string, idx: number) => (
                  <li key={idx}>• {d}</li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
)}