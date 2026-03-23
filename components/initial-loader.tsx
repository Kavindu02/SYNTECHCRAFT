"use client"

import { useEffect, useState } from "react"
import { AnimatedBrandWord } from "@/components/animated-brand-word"

export function InitialLoader() {
  const [isVisible, setIsVisible] = useState(true)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const exitTimer = window.setTimeout(() => {
      setIsExiting(true)
    }, 1450)

    const hideTimer = window.setTimeout(() => {
      setIsVisible(false)
    }, 1700)

    return () => {
      window.clearTimeout(exitTimer)
      window.clearTimeout(hideTimer)
    }
  }, [])

  if (!isVisible) return null

  return (
    <div className={`fixed inset-0 z-[120] flex items-center justify-center bg-black transition-opacity duration-300 ${isExiting ? "opacity-0" : "opacity-100"}`}>
      <div className="relative flex flex-col items-center gap-6">
        <span className="pointer-events-none absolute -top-10 h-24 w-24 rounded-full bg-yellow-400/15 blur-xl" />

        <div className="flex flex-col items-center gap-2 text-center">
          <AnimatedBrandWord />
          <div className="relative h-[2px] w-40 overflow-hidden rounded-full bg-yellow-100/15">
            <span className="absolute inset-y-0 left-0 w-14 rounded-full bg-yellow-300/90 blur-[0.5px] animate-[loader-scan_1.5s_ease-in-out_infinite]" />
          </div>
          <p className="text-[11px] uppercase tracking-[0.52em] text-yellow-100/75">
            Innovating Your Future
          </p>
          <div className="mt-1 flex items-center justify-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-yellow-300 animate-[dot-wave_1.2s_ease-in-out_infinite]" />
            <span className="h-2 w-2 rounded-full bg-yellow-300 animate-[dot-wave_1.2s_ease-in-out_infinite] [animation-delay:120ms]" />
            <span className="h-2 w-2 rounded-full bg-yellow-300 animate-[dot-wave_1.2s_ease-in-out_infinite] [animation-delay:240ms]" />
          </div>
        </div>
      </div>
    </div>
  )
}