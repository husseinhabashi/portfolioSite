"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, GraduationCap, Plus, Minus } from "lucide-react"

export default function EducationCertsPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const toggle = (index: number) => setOpenIndex(openIndex === index ? null : index)

  const sections = [
    {
      title: "Education",
      focus: "Formal academic foundation in computing and applied cybersecurity.",
      content: [
        "B.S. in Computer Science — Montclair State University",
        "Focus: Cybersecurity, Networking, and Machine Learning",
      ],
    },
    {
      title: "Completed Certifications",
      focus: "Practical SOC and incident response training (Level Effect).",
      content: [
        "SOC100-1 (Level Effect): Security Operations Fundamentals",
        "SOC100-2 (Level Effect): SOC Analyst Intermediate",
        "SOC100-3 (Level Effect): Advanced SOC Analysis, Incident Response, and Reverse Engineering",
      ],
    },
    {
      title: "In Progress",
      focus: "Actively expanding red and blue team specialization.",
      content: [
        "CDCP (Cyber Defense Certified Professional) — Level Effect (Expected: Nov 2025)",
        "HTB Certified Penetration Testing Specialist (HTB CPTS) — Hack The Box Academy",
      ],
    },
    {
      title: "Planned / Upcoming",
      focus: "Future targets for continued growth and professional mastery.",
      content: [
        "Offensive Security Certified Professional (OSCP) — Target 2025–2026",
      ],
    },
  ]

  return (
    <div className="relative min-h-screen bg-black text-green-400 font-mono overflow-hidden">
      <div className="cyber-grid" />

      {/* HEADER */}
      <header className="container mx-auto max-w-5xl px-4 pt-8 pb-6">
        <Link
          href="/main?fastload=true"
          className="inline-flex items-center gap-2 text-green-300/80 hover:text-green-300 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="mt-6 flex items-center gap-3">
          <GraduationCap className="h-5 w-5 text-green-400" />
          <h1 className="text-xl sm:text-2xl font-bold tracking-wide">
            Edu. & Certs
          </h1>
        </div>
        <p className="mt-2 text-xs sm:text-sm text-green-300/80">
          A blend of academic grounding and continuous upskilling through recognized cybersecurity programs.
        </p>
      </header>

      {/* MAIN BODY */}
      <main className="container mx-auto max-w-5xl px-4 pb-20 space-y-6">
        {sections.map((sec, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="border border-green-900/50 bg-black/60 rounded-lg p-4 hover:border-green-500/50 transition relative"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-sm sm:text-base font-semibold">{sec.title}</h2>
                <p className="text-xs sm:text-sm text-green-300/80 mt-1">
                  Focus: {sec.focus}
                </p>
              </div>

              <button
                onClick={() => toggle(i)}
                className="text-green-400 hover:text-green-300 transition"
              >
                {openIndex === i ? (
                  <Minus className="h-5 w-5" />
                ) : (
                  <Plus className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Expanded section */}
            <AnimatePresence>
              {openIndex === i && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-3 pl-3 border-l border-green-800/40"
                >
                  <ul className="list-disc list-inside text-xs sm:text-sm text-green-300/90 space-y-1">
                    {sec.content.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </main>
    </div>
  )
}