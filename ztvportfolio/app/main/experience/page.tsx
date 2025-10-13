"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, BriefcaseBusiness, Plus, Minus } from "lucide-react"

export default function ExperiencePage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const toggle = (index: number) => setOpenIndex(openIndex === index ? null : index)

  const experiences = [
    {
      title: "Level Effect — Community Junior SOC Analyst (Remote)",
      period: "March 2025 – Present",
      summary:
        "Real-world SOC experience blending blue-team defense with offensive insight.",
      focus:
        "Detection engineering, EDR tuning, MITRE ATT&CK correlation, SOC workflow automation.",
      details: [
        "Performed Tier 1 & 2 triage, log analysis, and endpoint investigations — cutting MTTR by 20%.",
        "Authored new IR playbooks that streamlined escalation paths and reduced response time by 30%.",
        "Tuned SIEM detections and EDR rules to boost true-positive accuracy by 90% and cut noise by 25%.",
        "Mentored SOC100 students through simulated incidents and labs, reinforcing fundamentals in threat hunting and network forensics.",
      ],
      takeaway:
        "Solidified understanding of blue-team operations — knowledge I now weaponize for red-team tooling and detection bypass testing.",
    },
    {
      title: "Montclair State University — Cybersecurity & Networking Intern (Hybrid)",
      period: "May 2025 – Sep 2025",
      summary:
        "Supported university IT and security operations, developing early detection and hardening skills.",
      focus: "Network defense, system hardening, vulnerability management.",
      details: [
        "Conducted vulnerability scans and endpoint hardening, documented incidents, and improved asset visibility.",
        "Analyzed network traffic and supported internal security awareness sessions.",
        "Optimized log-collection pipelines for faster detection and improved correlation.",
      ],
      takeaway:
        "Gained hands-on experience in enterprise infrastructure monitoring and full security lifecycle operations.",
    },
    {
      title: "Data Center Operations Technician",
      period: "Sep 2019 – Mar 2022",
      summary:
        "Worked in a production data-center environment managing server deployments, network cabling, and performance monitoring.",
      focus:
        "Infrastructure reliability, baseline monitoring, physical-to-logical network security.",
      details: [
        "Deployed and maintained physical servers and patching schedules, improving uptime by 18%.",
        "Analyzed access logs and system metrics for anomalies.",
        "Collaborated with ops and security teams to enforce hardening and firmware patching standards.",
      ],
      takeaway:
        "Learned systems-level thinking and disciplined operational workflows that shaped my cybersecurity foundation.",
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
          <BriefcaseBusiness className="h-5 w-5 text-green-400" />
          <h1 className="text-xl sm:text-2xl font-bold tracking-wide">
            Professional Experience
          </h1>
        </div>
        <p className="mt-2 text-xs sm:text-sm text-green-300/80">
          Real-world experience bridging blue-team operations, security engineering, and infrastructure reliability.
        </p>
      </header>

      {/* EXPERIENCE LIST */}
      <main className="container mx-auto max-w-5xl px-4 pb-20 space-y-6">
        {experiences.map((exp, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="border border-green-900/50 bg-black/60 rounded-lg p-4 hover:border-green-500/50 transition relative"
          >
            {/* Header Row */}
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-sm sm:text-base font-semibold">
                  {exp.title}
                </h2>
                <p className="text-[11px] sm:text-xs text-green-300/80 mt-1">
                  {exp.period}
                </p>
                <p className="text-xs sm:text-sm text-green-300/80 mt-2">
                  {exp.summary}
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

            {/* Expanded Detail Section */}
            <AnimatePresence>
              {openIndex === i && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 pl-2 border-l border-green-800/40"
                >
                  {exp.focus && (
                    <p className="text-xs text-green-400 mb-2">
                      <strong>Focus Areas:</strong> {exp.focus}
                    </p>
                  )}

                  {exp.details && (
                    <ul className="list-disc list-inside text-xs sm:text-sm text-green-300/90 space-y-1 mb-3">
                      {exp.details.map((d, idx) => (
                        <li key={idx}>{d}</li>
                      ))}
                    </ul>
                  )}

                  {exp.takeaway && (
                    <p className="text-[11px] italic text-green-400/70 mt-4 border-t border-green-900/30 pt-2">
                      {exp.takeaway}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </main>
    </div>
  )
}