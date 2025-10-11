"use client"

import { motion } from "framer-motion"
import CategoryBox from "./CategoryBox"
import { useEffect } from "react"

const categories = [
  { title: "Skills", href: "/main/skills", color: "green" },
  { title: "Projects", href: "/main/projects", color: "cyan" },
  { title: "Experience", href: "/main/experience", color: "amber" },
  { title: "Certifications", href: "/main/certifications", color: "purple" },
]

export default function DashboardGrid({ onComplete }: { onComplete?: () => void }) {
  useEffect(() => {
    // Fire callback once last box has animated
    const totalDelay = (categories.length - 1) * 0.25 + 0.6 // same timing as animation
    const timer = setTimeout(() => onComplete?.(), totalDelay * 1000)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12 max-w-5xl w-full">
      {categories.map((cat, i) => (
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
  )
}