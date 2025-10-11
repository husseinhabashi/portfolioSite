"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, TerminalSquare } from "lucide-react"

const skills = [
  { title: "Vulnerability Chaining", desc: "Privilege escalation, chaining low-severity findings into high-impact exploits." },
  { title: "Web Application Exploitation", desc: "Authentication bypass, logic flaws, and token misconfigurations." },
  { title: "Scripting & Automation", desc: "Bash, PowerShell, Lua scripting for recon and exploitation." },
  { title: "Recon & Fingerprinting", desc: "Burp Suite, Nmap, SQLMap, Hydra — discovering and analyzing attack surfaces." },
  { title: "SOC Triage & Detection", desc: "Tier 1/2 triage, ELK, Sigma, endpoint telemetry, IR playbooks." },
  { title: "Threat Intel & Reverse Engineering", desc: "MITRE ATT&CK mapping, malware basics, OpenCTI integration." },
]

const tools = [
  "Burp Suite", "Metasploit", "Nmap", "SQLMap", "Hydra", "Wireshark",
  "ELK Stack", "Sysinternals", "Velociraptor", "Hayabusa",
  "NetworkMiner", "OpenCTI", "Kali Linux"
]

export default function SkillsPage() {
  const [detail, setDetail] = useState<{ title: string; desc: string } | null>(null)

  return (
    <div className="relative min-h-screen bg-black text-green-400 font-mono overflow-hidden">
      <div className="cyber-grid" />

      {/* HEADER */}
      <header className="container mx-auto max-w-5xl px-4 pt-8 pb-4">
        <Link href="/main?fastload=true" className="inline-flex items-center gap-2 text-green-300/80 hover:text-green-300 transition">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>

        <div className="mt-6 flex items-center gap-3">
          <TerminalSquare className="h-5 w-5 text-green-400" />
          <h1 className="text-xl sm:text-2xl font-bold tracking-wide">Skills & Tools</h1>
        </div>
      </header>

      {/* SKILLS GRID */}
      <main className="container mx-auto max-w-5xl px-4 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
          {skills.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-green-800/60 bg-black/60 p-4 relative"
            >
              <div className="flex justify-between items-start">
                <h2 className="text-sm sm:text-base font-semibold">{s.title}</h2>
                <button
                  onClick={() => setDetail(s)}
                  className="text-green-300/80 hover:text-green-200 text-xs transition"
                >
                  More ▸
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* TOOLS */}
        <div className="mt-10 border-t border-green-800/60 pt-6">
          <h2 className="text-sm sm:text-base font-semibold mb-3">Tools</h2>
          <div className="flex flex-wrap gap-2">
            {tools.map((t) => (
              <span key={t} className="px-2.5 py-1 rounded-md border border-green-700/60 text-[11px] sm:text-xs bg-black/60">
                {t}
              </span>
            ))}
          </div>
        </div>
      </main>

      {/* DETAIL MODAL */}
      <AnimatePresence>
        {detail && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 flex items-center justify-center bg-black/70 z-50"
          >
            <div className="bg-black/90 border border-green-800 rounded-xl p-6 w-80 sm:w-96 relative text-sm text-green-300">
              <button
                onClick={() => setDetail(null)}
                className="absolute top-3 right-3 text-green-400 hover:text-red-400 transition"
              >
                ✕
              </button>
              <h3 className="text-base font-semibold mb-2">{detail.title}</h3>
              <p className="leading-relaxed text-green-300/90">{detail.desc}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}