"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { AnimatedBrandWord } from "@/components/animated-brand-word"

const LOADER_EXIT_MS = 1450
const LOADER_HIDE_MS = 1700

export function RouteTransitionLoader() {
  const pathname = usePathname()
  const hasMountedRef = useRef(false)
  const previousPathRef = useRef(pathname)
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      previousPathRef.current = pathname
      return
    }

    if (previousPathRef.current === pathname) {
      return
    }

    previousPathRef.current = pathname
    setIsVisible(true)
    setIsExiting(false)

    const exitTimer = window.setTimeout(() => {
      setIsExiting(true)
    }, LOADER_EXIT_MS)

    const hideTimer = window.setTimeout(() => {
      setIsVisible(false)
    }, LOADER_HIDE_MS)

    return () => {
      window.clearTimeout(exitTimer)
      window.clearTimeout(hideTimer)
    }
  }, [pathname])

  if (!isVisible) return null

  return (
    <div className={`fixed inset-0 z-[110] flex items-center justify-center bg-black transition-opacity duration-300 ${isExiting ? "opacity-0" : "opacity-100"}`}>
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