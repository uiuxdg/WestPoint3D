"use client"

interface NavigationDotsProps {
  total: number
  active: number
  onChange: (index: number) => void
  labels?: string[]
}

export function NavigationDots({ total, active, onChange, labels }: NavigationDotsProps) {
  return (
    <nav className="fixed right-[3dvw] top-[18%] z-40 md:top-1/2 md:-translate-y-1/2">
      <ul className="flex flex-col gap-1 md:gap-4">
        {Array.from({ length: total }).map((_, i) => (
          <li key={i} className="group relative flex items-center justify-end gap-2">
            <span
              className="pointer-events-none absolute right-full mr-2 hidden md:inline-flex opacity-0 group-hover:opacity-100 transition-opacity duration-0"
              aria-hidden
            >
              <span className="rounded-l-2xl border-2 border-r-0 border-white/30 bg-linear-to-br from-white/10 via-white/10 to-zinc-500/30 px-3 py-1.5 pr-[2.8vmin] text-lg font-medium text-white/90 shadow-[-1.8vmin_-1.8vmin_6.5vmin_0_rgba(214,214,214,0.2)] whitespace-nowrap">
                {labels?.[i] ?? `Section ${i + 1}`}
              </span>
              <span
                className="absolute left-full top-1/2 h-0 w-0 -translate-y-1/2 border-y-[0.55vmin] border-l-[0.75vmin] border-y-transparent border-l-zinc-500/30"
                style={{ filter: "brightness(0.9)" }}
              />
            </span>
            <button
              onClick={() => onChange(i)}
              className={`block h-[3.2vmin] w-[3.2vmin] md:h-[2.2vmin] md:w-[2.2vmin] shrink-0 rounded-full transition-all ${
                i === active ? "scale-125 bg-red-500 shadow-[0_0_0.6vmin_rgba(239,68,68,0.65)]" : "bg-zinc-600 hover:bg-red-700/80"
              }`}
              aria-label={labels?.[i] ?? `Go to section ${i + 1}`}
            />
          </li>
        ))}
      </ul>
    </nav>
  )
}
