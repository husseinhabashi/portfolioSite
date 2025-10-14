"use client"

import { motion } from "framer-motion"
import { useEffect } from "react"
import { Mail } from "lucide-react"
import CategoryBox from "./CategoryBox"

const categories = [
  { title: "Skills", href: "/main/skills", color: "green" },
  { title: "Projects", href: "/main/projects", color: "cyan" },
  { title: "Experience", href: "/main/experience", color: "amber" },
  { title: "Certifications", href: "/main/certifications", color: "purple" },
  { title: "Contact Me", href: "/main/contact", color: "emerald", icon: <Mail className="h-5 w-5 text-green-400" /> },
]

export default function DashboardGrid({ onComplete }: { onComplete?: () => void }) {
  useEffect(() => {
    const totalDelay = (categories.length - 1) * 0.25 + 0.6
    const timer = setTimeout(() => onComplete?.(), totalDelay * 1000)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="flex flex-col items-center mt-12 w-full max-w-5xl">
      {/* Top grid (first 4 boxes in 2x2 layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
        {categories.slice(0, 4).map((cat, i) => (
          <motion.div
            key={cat.title}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.25, duration: 0.6 }}
          >
            <CategoryBox {...cat} />
          </motion.div>
        ))}
      </div>

      {/* Centered 5th box */}
      <motion.div
        key={categories[4].title}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: categories.length * 0.25, duration: 0.6 }}
        className="mt-8 flex justify-center w-full sm:w-1/2"
      >
        <CategoryBox {...categories[4]} />
      </motion.div>
    </div>
  )
}