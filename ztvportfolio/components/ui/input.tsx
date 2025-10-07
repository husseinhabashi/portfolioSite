import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // ✨ Base hacker terminal style
        "w-full px-4 py-2 font-mono text-[#00ff66] bg-black border-2 border-[#00ff66] rounded-md shadow-[0_0_12px_#00ff66] placeholder-[#00cc55]/70",
        "transition-all duration-200 outline-none",
        // ✨ Focus state glow
        "focus:border-[#00ff99] focus:ring-2 focus:ring-[#00ff99] focus:shadow-[0_0_20px_#00ff99]",
        // ✨ Disabled state
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:border-[#006633]/50",
        // ✨ Error state
        "aria-invalid:border-red-500 aria-invalid:shadow-[0_0_12px_#ff0033]",
        className
      )}
      {...props}
    />
  )
}

export { Input }