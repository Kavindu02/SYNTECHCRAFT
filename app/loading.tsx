import { AnimatedBrandWord } from "@/components/animated-brand-word"

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black">
      <div className="relative flex flex-col items-center gap-6">
        <span className="pointer-events-none absolute -top-10 h-24 w-24 rounded-full bg-yellow-400/15 blur-xl" />

        <div className="flex flex-col items-center gap-2 text-center">
          <AnimatedBrandWord />
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