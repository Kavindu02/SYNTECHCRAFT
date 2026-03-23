import type { CSSProperties } from "react"

const letterMotion = [
  { char: "S", x: -72, y: -48, delay: 0 },
  { char: "Y", x: 64, y: -54, delay: 34 },
  { char: "N", x: -58, y: 44, delay: 68 },
  { char: "T", x: 66, y: 40, delay: 102 },
  { char: "E", x: -78, y: 14, delay: 136 },
  { char: "C", x: 82, y: -18, delay: 170 },
  { char: "H", x: -52, y: -62, delay: 204 },
  { char: "C", x: 56, y: 68, delay: 238 },
  { char: "R", x: -70, y: -38, delay: 272 },
  { char: "A", x: 74, y: 50, delay: 306 },
  { char: "F", x: -62, y: 60, delay: 340 },
  { char: "T", x: 60, y: -44, delay: 374 },
] as const

export function AnimatedBrandWord() {
  return (
    <div className="flex items-center justify-center gap-0 text-3xl font-black italic tracking-[0.01em] animate-[text-glow_1.8s_ease-in-out_infinite_1s]">
      {letterMotion.map((letter, index) => {
        const isSynPart = index < 3
        const style = {
          "--tx": `${letter.x}px`,
          "--ty": `${letter.y}px`,
          "--delay": `${letter.delay}ms`,
        } as CSSProperties

        return (
          <span
            key={`${letter.char}-${index}`}
            className={`loader-letter ${isSynPart
              ? "text-slate-200 [text-shadow:0_0_10px_rgba(226,232,240,0.2)]"
              : "text-amber-400 [text-shadow:0_0_12px_rgba(251,191,36,0.35)]"
              }`}
            style={style}
          >
            {letter.char}
          </span>
        )
      })}
    </div>
  )
}