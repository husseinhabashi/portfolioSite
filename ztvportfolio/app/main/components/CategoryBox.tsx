"use client"
import { useRouter } from "next/navigation"

export default function CategoryBox({ title, href, color }: { title: string; href: string; color: string }) {
  const router = useRouter()

  return (
    <div
      onClick={() => router.push(href)}
      className={`
        border border-${color}-500 hover:bg-${color}-500/10 
        text-${color}-400 font-mono
        rounded-xl p-6 cursor-pointer select-none
        transition-all duration-300 hover:scale-105
        shadow-[0_0_15px_rgba(0,255,0,0.3)] hover:shadow-[0_0_25px_rgba(0,255,0,0.6)]
      `}
    >
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="text-sm opacity-70 mt-2">Explore {title.toLowerCase()} →</p>
    </div>
  )
}