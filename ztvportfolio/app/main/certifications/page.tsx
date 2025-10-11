"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, BadgeCheck, X } from "lucide-react"

const certs = [
  {
    name: "Cyber Defense Certified Professional (CDCP)",
    issuer: "Level Effect",
    year: "In Progress",
  },
  {
    name: "SOC100-1",
    issuer: "Level Effect",
    year: "2025",
    details: `Covers Tier 1 SOC fundamentals: log analysis, endpoint triage,
alert correlation, and SIEM workflow management. Focused on 
Windows/Linux incident triage and investigation techniques.`,
  },
  {
    name: "SOC100-2",
    issuer: "Level Effect",
    year: "2025",
    details: `Intermediate SOC operations: network threat hunting,
packet-level analysis with Wireshark and Zeek, and use of Yara
and Sysinternals for malware identification.`,
  },
  {
    name: "SOC100-3",
    issuer: "Level Effect",
    year: "2025",
    details: `Advanced detection engineering: building Sigma rules, 
automating triage workflows in ELK, and developing MITRE-aligned 
playbooks for high-fidelity detections.`,
  },
  {
    name: "CompTIA Security+ / Network+",
    issuer: "CompTIA",
    year: "In Progress",
  },
  {
    name: "OSCP (HackTheBox Certs)",
    issuer: "OffSec / HTB",
    year: "In Progress",
  },
]

export default function CertificationsPage() {
  const [active, setActive] = useState<number | null>(null)

  return (
    <div className="relative min-h-screen bg-black text-green-400 font-mono overflow-hidden">
      <div className="cyber-grid" />

      {/* 🧭 Header */}
      <header className="container mx-auto max-w-4xl px-4 pt-8 pb-4">
        <Link
          href="/main?fastload=true"
          className="inline-flex items-center gap-2 text-green-300/80 hover:text-green-300 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>

        <div className="mt-6 flex items-center gap-3">
          <BadgeCheck className="h-5 w-5 text-green-400" />
          <h1 className="text-xl sm:text-2xl font-bold tracking-wide">Certifications</h1>
        </div>
      </header>

      {/* 📜 Certification list */}
      <main className="container mx-auto max-w-4xl px-4 pb-20">
        {certs.map((c, i) => (
          <motion.div
            key={c.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-green-800/60 bg-black/60 p-4 mb-3"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-sm sm:text-base font-semibold">{c.name}</h2>
                <p className="text-[11px] sm:text-xs text-green-300/80">{c.issuer}</p>
              </div>
              <div className="text-xs text-green-300/80 flex items-center gap-3">
                {c.details && (
                  <button
                    onClick={() => setActive(active === i ? null : i)}
                    className="text-green-400 hover:text-green-300 transition underline"
                  >
                    {active === i ? "Hide" : "More"}
                  </button>
                )}
                <span>{c.year}</span>
              </div>
            </div>

            {/* 🧩 Details popup */}
            <AnimatePresence>
              {active === i && c.details && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.25 }}
                  className="mt-3 rounded-lg border border-green-700 bg-black/80 p-3 relative"
                >
                  <button
                    onClick={() => setActive(null)}
                    className="absolute top-2 right-2 text-green-400 hover:text-red-400 transition"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <p className="text-xs text-green-300/90 leading-relaxed whitespace-pre-line">
                    {c.details}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </main>
    </div>
  )
}