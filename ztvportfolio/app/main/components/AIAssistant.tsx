"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"

export default function AIAssistant() {
  const [active, setActive] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<{ sender: "user" | "nova"; text: string }[]>([])
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const newMessage = input.trim()
    setMessages(prev => [...prev, { sender: "user", text: newMessage }])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/nova", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newMessage }),
      })
      const data = await res.json()

      const reply =
        data.output_text || data.choices?.[0]?.message?.content || "[No response from Nova]"

      setMessages(prev => [...prev, { sender: "nova", text: reply }])
    } catch {
      setMessages(prev => [...prev, { sender: "nova", text: "⚠️ Connection error." }])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative text-green-400 font-mono text-sm"
    >
      {/* 🔘 Collapsed state */}
      {!active ? (
  <button
    onClick={() => setActive(true)}
    className="cursor-pointer border border-indigo-600 text-indigo-300 hover:text-white hover:bg-indigo-800/20
               px-5 py-3 rounded-full text-sm flex items-center gap-2 nova-glow transition-all duration-300"
  >
    <span className="text-indigo-400">Ask Nova</span>
  </button>
) : (
        /* 💬 Expanded Chat Window */
        <div
          className="flex flex-col w-96 sm:w-[420px] h-[520px] rounded-2xl border border-green-800 bg-black/90 backdrop-blur-sm shadow-lg fixed bottom-6 right-6 z-50"
          style={{ boxShadow: "0 0 20px rgba(0,255,0,0.15)" }}
        >
          {/* 🧠 Header */}
          <div className="flex items-center justify-between border-b border-green-800 px-4 py-2 text-xs">
            <span className="text-green-400 font-semibold">Nova — AI Assistant</span>
            <button
              onClick={() => setActive(false)}
              className="text-green-400 hover:text-red-400 transition text-xs"
            >
              ✕
            </button>
          </div>

          {/* 🧾 Chat Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <p className="text-green-400/70 text-xs italic">
                “Hi, I’m Nova — Hussein’s digital assistant. How can I help?”
              </p>
            )}

           {messages.map((msg, i) => (
  <div
    key={i}
    className={`flex ${
      msg.sender === "user" ? "justify-end" : "justify-start"
    }`}
  >
    <div
      className={`max-w-[75%] px-3 py-2 rounded-lg text-xs sm:text-sm leading-relaxed break-words ${
        msg.sender === "user"
          ? "bg-green-800/30 border border-green-700 text-green-200 self-end rounded-br-none"
          : "bg-sky-900/30 border border-sky-700 text-sky-300 self-start rounded-bl-none italic"
      }`}
    >
      {msg.text}
    </div>
  </div>
))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-indigo-900/30 border border-indigo-600 text-indigo-300 self-start rounded-bl-none italic shadow-[0_0_8px_rgba(99,102,241,0.4)]">
                  Nova is thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 🧠 Input Bar */}
          <form onSubmit={sendMessage} className="flex gap-2 border-t border-green-800 p-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-black border border-green-700 text-green-300 rounded-md p-2 text-xs outline-none placeholder-green-800/60"
            />
            <button
              type="submit"
              disabled={loading}
              className="border border-green-700 px-3 rounded-md text-green-400 hover:bg-green-700/20 transition"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </motion.div>
  )
}