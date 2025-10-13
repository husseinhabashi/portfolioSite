"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, TerminalSquare, Plus, Minus } from "lucide-react"

export default function SkillsPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const toggle = (index: number) => setOpenIndex(openIndex === index ? null : index)

  const skillSections = [
    {
      title: "Offensive Security",
      focus: "Red-team, exploitation, and post-exploitation",
      skills: [
        "Web Exploitation · Privilege Escalation · Vulnerability Chaining",
        "Penetration Testing · Exploit Development · Reverse Engineering",
        "Post-Exploitation & Persistence Techniques",
        "Threat Simulation (MITRE ATT&CK Tactics)",
      ],
    },
    {
      title: "Defensive Operations (Blue Team / SOC)",
      focus: "SOC + detection engineering and response",
      skills: [
        "SOC Tier 1 & 2 Triage · Case Management · Incident Response",
        "Threat Hunting · Alert Analysis · Forensics",
        "SIEM (ELK, Splunk) · Detection Engineering with SIGMA",
        "EDR Tuning · Log Aggregation · MITRE ATT&CK Mapping",
        "Memory & Disk Forensics (Velociraptor · Hayabusa · NetworkMiner)",
      ],
    },
    {
      title: "Network & Endpoint Analysis",
      focus: "Systems-level and network traffic understanding",
      skills: [
        "Network Protocol Analysis (Wireshark, TCPDump)",
        "Windows Endpoint Triage (Sysinternals Suite)",
        "Network Hardening & Vulnerability Scanning (Nmap, OpenVAS)",
        "Firewall & IDS/IPS Event Correlation",
      ],
    },
    {
      title: "Reconnaissance & Intelligence",
      focus: "Recon and CTI intelligence correlation",
      skills: [
        "Reconnaissance & Fingerprinting (Burp Suite, SQLMap, Hydra)",
        "OSINT & Enumeration Automation",
        "Cyber Threat Intelligence (CTI) · OpenCTI Integration",
        "Attack Surface Mapping · Subdomain & Service Discovery",
      ],
    },
    {
      title: "Scripting & Automation",
      focus: "Practical automation across red and blue workflows",
      skills: [
        "Bash · PowerShell · Python · Lua",
        "Automation of Recon & Exploitation Pipelines",
        "API Integration & Tooling Automation",
        "Script-Based Detection & EDR Bypass Prototyping",
      ],
    },
    {
      title: "Tools & Frameworks",
      focus: "Hands-on stack used across engagements",
      skills: [
        "Burp Suite · Nmap · SQLMap · Hydra",
        "Wireshark · Sysinternals · Velociraptor · NetworkMiner",
        "ELK Stack · SIGMA · MITRE ATT&CK Navigator",
        "Hayabusa · OpenCTI · BloodHound · SharpHound",
      ],
    },
    {
      title: "Technical Reporting & Documentation",
      focus: "Communicating technical findings effectively",
      skills: [
        "Technical Writing · Incident Documentation",
        "Threat Report Authoring · IOC Extraction",
        "Playbook & SOP Development",
        "Stakeholder Reporting & Post-Incident Debriefs",
      ],
    },
    {
      title: "Miscellaneous",
      focus: "Soft but critical technical habits",
      skills: [
        "Cross-Functional Collaboration (SOC ↔ Engineering)",
        "Lab Environment Setup (VMware, Kali, Windows Server)",
        "Documentation Automation · Git · CI/CD Familiarity",
        "Continuous Learning (HTB · Level Effect · CompTIA)",
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
          <TerminalSquare className="h-5 w-5 text-green-400" />
          <h1 className="text-xl sm:text-2xl font-bold tracking-wide">
            Skills & Competencies
          </h1>
        </div>
        <p className="mt-2 text-xs sm:text-sm text-green-300/80">
          Organized by domain focus — showing practical balance between offense, defense, and automation.
        </p>
      </header>

      {/* SKILLS SECTIONS */}
      <main className="container mx-auto max-w-5xl px-4 pb-20 space-y-6">
        {skillSections.map((section, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="border border-green-900/50 bg-black/60 rounded-lg p-4 hover:border-green-500/50 transition relative"
          >
            {/* Header row */}
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-sm sm:text-base font-semibold">
                  {section.title}
                </h2>
                <p className="text-xs sm:text-sm text-green-300/80 mt-1">
                  Focus: {section.focus}
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

            {/* Expanded skills */}
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
                    {section.skills.map((skill, idx) => (
                      <li key={idx}>{skill}</li>
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