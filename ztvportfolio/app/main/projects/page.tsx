"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Code2,
  Cpu,
  Radio,
  Lock,
  Terminal,
  Plus,
  Minus,
  BrainCircuit,
  ExternalLink,
} from "lucide-react"

export default function ProjectsPage() {
  const router = useRouter()

  const projects = [
    {
      title: "GraphCrack — Offensive GraphQL Security Framework",
      icon: <Terminal className="h-5 w-5 text-green-400" />,
      summary:
        "An offensive GraphQL exploitation engine that automates endpoint discovery, introspection, JWT attacks, and privilege escalation for authorized red-team ops.",
      tech: "Python · httpx · GraphQL · JWT · asyncio · argparse · modular architecture design",
      details: [
        "Built centralized GraphQLClient to unify all request handling, session management, and realistic traffic shaping.",
        "Implemented JWT attack suite with HS256/RS256 detection, brute forcing, and JKU/kid abuse validation.",
        "Automated full kill chain: discovery → introspection → exploitation → reporting (JSON/Markdown PoC).",
        "Integrated jitter, proxy rotation, and concurrency controls to simulate human attackers under WAFs.",
        "Reduced duplicated HTTP logic by 70% and improved reliability in cloud-scale fuzzing environments.",
      ],
      link: "https://github.com/husseinhabashi/portfolioSite",
      quote:
        "⚙️ GraphCrack bridges the gap between offensive research and defensive validation — showing how attackers weaponize GraphQL misconfigurations.",
    },
    {
      title: "WebHound — Recon & Fingerprinting Engine (in development)",
      icon: <Radio className="h-5 w-5 text-green-400" />,
      summary:
        "A Lua-powered reconnaissance tool integrated with Nmap to fingerprint web apps, detect attack surfaces, and chain vulnerabilities faster.",
      tech: "Lua · Nmap Scripting Engine · Python · Shell · Network Recon · Fingerprinting",
      details: [
        "Automates HTTP parameter and header enumeration to reveal hidden endpoints.",
        "Identifies WAFs, frameworks, and server-side tech signatures.",
        "Maps recon data to potential chaining paths for exploit development.",
      ],
    },
    {
      title: "Ghost Node — Voice-Activated Ping API",
      icon: <Cpu className="h-5 w-5 text-green-400" />,
      summary:
        "An Alexa-integrated API that lets users run real-time ping diagnostics with voice commands, secured with JWT and token-based API auth.",
      tech:
        "AWS Lambda · Alexa Skills Kit · Python 3 · Render API · REST · JWT Auth · CloudWatch",
      details: [
        "Processes natural speech (e.g., 'eight point eight point eight point eight') into valid network targets.",
        "Implements secure REST API with token validation and latency computation.",
        "CloudWatch integration for audit logging and uptime tracing.",
        "Modular design prepared for future traceroute / WHOIS / DNS lookup intents.",
      ],
      link: "https://github.com/husseinhabashi/alexa-ping-api",
      quote:
        "🧩 Merges cloud automation, networking, and voice interaction — a playful but secure experiment in serverless design.",
    },
    {
      title: "Moda — Adaptive AI-Driven iOS App",
      icon: <BrainCircuit className="h-5 w-5 text-green-400" />,
      summary:
        "A context-aware iOS app that learns from environment data (weather, time, behavior) to provide adaptive user experiences.",
      tech: "Swift · SwiftUI · Core ML · Firebase · REST APIs · SQLite",
      details: [
        "Built intelligent recommendation engine using Core ML + contextual data.",
        "Integrated API orchestration with caching for offline resilience.",
        "Privacy-focused — no third-party data sharing or analytics pipelines.",
        "Modular SwiftUI architecture with reactive UI updates.",
      ],
      link: "https://github.com/husseinhabashi/modaAiApp",
    },
    {
      title: "CTF Challenges & Labs",
      icon: <Lock className="h-5 w-5 text-green-400" />,
      summary:
        "Completed 50+ Capture-the-Flag challenges in web exploitation, developing advanced chaining and analysis skills.",
      tech: "Burp Suite · SQLMap · Wireshark · CyberChef · HackTheBox · TryHackMe",
      details: [
        "Practiced exploit chaining across injection, logic flaws, and misconfigurations.",
        "Built personal exploit workflows for privilege escalation scenarios.",
        "Strengthened investigative mindset and real-world offensive thinking.",
      ],
    },
  ]

  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const toggle = (index: number) => setOpenIndex(openIndex === index ? null : index)

  return (
    <div className="relative min-h-screen bg-black text-green-400 font-mono overflow-hidden">
      <div className="cyber-grid" />

      <header className="container mx-auto max-w-5xl px-4 pt-8 pb-6">
        <Link
          href="/main?fastload=true"
          className="inline-flex items-center gap-2 text-green-300/80 hover:text-green-300 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="mt-6 flex items-center gap-3">
          <Code2 className="h-5 w-5 text-green-400" />
          <h1 className="text-xl sm:text-2xl font-bold tracking-wide">
            Technical Projects
          </h1>
        </div>
        <p className="mt-2 text-xs sm:text-sm text-green-300/80">
          Offensive security tools, automation frameworks, and experimental systems engineered for real-world application.
        </p>
      </header>

      <main className="container mx-auto max-w-5xl px-4 pb-20 space-y-6">
        {projects.map((proj, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="border border-green-900/50 bg-black/60 rounded-lg p-4 hover:border-green-500/50 transition relative"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  {proj.icon}
                  <h2 className="text-sm sm:text-base font-semibold">{proj.title}</h2>
                </div>
                <p className="text-xs sm:text-sm text-green-300/80 mt-2">{proj.summary}</p>
              </div>

              <button
                onClick={() => toggle(i)}
                className="text-green-400 hover:text-green-300 transition"
              >
                {openIndex === i ? <Minus className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              </button>
            </div>

            <AnimatePresence>
              {openIndex === i && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 pl-2 border-l border-green-800/40"
                >
                  <p className="text-xs text-green-400 mb-2">
                    <strong>Tech Stack:</strong> {proj.tech}
                  </p>

                  {proj.details && (
                    <ul className="list-disc list-inside text-xs sm:text-sm text-green-300/90 space-y-1 mb-3">
                      {proj.details.map((d, idx) => (
                        <li key={idx}>{d}</li>
                      ))}
                    </ul>
                  )}

                  {proj.link && (
                    <div className="mt-2">
                      <a
                        href={proj.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-green-400 hover:text-green-300 text-xs underline"
                      >
                        <ExternalLink className="h-3 w-3" /> View Project on GitHub
                      </a>
                    </div>
                  )}

                  {proj.quote && (
                    <p className="text-[11px] italic text-green-400/70 mt-4 border-t border-green-900/30 pt-2">
                      {proj.quote}
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