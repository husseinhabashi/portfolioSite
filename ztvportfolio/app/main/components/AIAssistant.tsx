"use client"

import { useState } from "react"
import { motion } from "framer-motion"

export default function AIAssistant() {
  const [active, setActive] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      onClick={() => setActive(!active)}
      className="relative rounded-2xl transform-gpu transition-all duration-300 cursor-pointer
                 border border-green-700 text-green-400 font-mono text-sm p-4 bg-transparent"
      style={{
        backgroundColor: "transparent",
        boxShadow: "none",
        filter: "none",
      }}
    >
      {!active ? (
        <p className="text-center select-none">🤖 Ask Nova</p>
      ) : (
        <div
          className="w-72 h-64 rounded-2xl p-3 overflow-y-auto border border-green-800 bg-transparent"
          style={{
            boxShadow: "none",
            backgroundColor: "transparent",
          }}
        >
          <p className="text-xs text-green-400 opacity-80 leading-relaxed">
            [AI Terminal Active] — “Hello, I’m Nova, Hussein’s digital assistant.  
            I'm still in product :( !”
          </p>
        </div>
      )}
    </motion.div>
  )
}