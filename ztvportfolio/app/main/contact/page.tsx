"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Phone, Linkedin, Mail, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ContactPage() {
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopy = async (label: string, value: string) => {
    await navigator.clipboard.writeText(value)
    setCopied(label)
    setTimeout(() => setCopied(null), 1500)
  }

  const contacts = [
    {
      label: "Phone",
      icon: <Phone className="h-5 w-5 text-green-400" />,
      value: "+1 (908) 547-7030",
      href: "tel:+19085477030",
    },
    {
      label: "LinkedIn",
      icon: <Linkedin className="h-5 w-5 text-green-400" />,
      value: "linkedin.com/in/husseinhabashi",
      href: "https://www.linkedin.com/in/husseinhabashi/",
    },
    {
      label: "Email",
      icon: <Mail className="h-5 w-5 text-green-400" />,
      value: "habashi.hussein03@gmail.com",
      href: "mailto:habashi.hussein03@gmail.com",
    },
  ]

  return (
    <div className="relative min-h-screen bg-black text-green-400 font-mono overflow-hidden">
      <div className="cyber-grid" />

      {/* 🧭 Header */}
      <header className="container mx-auto max-w-4xl px-4 pt-8 pb-6">
        <Link
          href="/main?fastload=true"
          className="inline-flex items-center gap-2 text-green-300/80 hover:text-green-300 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>

        <div className="mt-6 flex items-center gap-3">
          <Mail className="h-5 w-5 text-green-400" />
          <h1 className="text-xl sm:text-2xl font-bold tracking-wide">Contact</h1>
        </div>
        <p className="mt-2 text-xs sm:text-sm text-green-300/80">
          Let’s connect — reach me via phone, LinkedIn, or email.
        </p>
      </header>

      {/* 📇 Contact Details */}
      <main className="container mx-auto max-w-4xl px-4 pb-20 space-y-4">
        {contacts.map((contact, i) => (
          <motion.div
            key={contact.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center justify-between border border-green-800/60 bg-black/60 rounded-lg p-4 hover:border-green-500/50 transition"
          >
            <div className="flex items-center gap-3">
              {contact.icon}
              <div>
                <p className="text-sm sm:text-base font-semibold">{contact.label}</p>
                <a
                  href={contact.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs sm:text-sm text-green-300/80 hover:text-green-200 transition"
                >
                  {contact.value}
                </a>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleCopy(contact.label, contact.value)}
              className="text-green-400 hover:text-black hover:bg-green-400 transition"
            >
              {copied === contact.label ? (
                <Check className="h-4 w-4 text-green-900" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </motion.div>
        ))}
      </main>
    </div>
  )
}