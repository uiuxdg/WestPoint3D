"use client"

interface NavigationDotsProps {
  total: number
  active: number
  onChange: (index: number) => void
  labels?: string[]
}

export function NavigationDots({ total, active, onChange, labels }: NavigationDotsProps) {
  return (
    <nav className="fixed right-8 top-[18%] z-40 md:top-1/2 md:-translate-y-1/2">
      <ul className="flex flex-col gap-1 md:gap-4">
        {Array.from({ length: total }).map((_, i) => (
          <li key={i} className="group relative flex items-center justify-end gap-2">
            <span
              className="pointer-events-none absolute right-full mr-2 hidden md:inline-flex opacity-0 group-hover:opacity-100 transition-opacity duration-0"
              aria-hidden
            >
              <span className="rounded-l-2xl border-2 border-r-0 border-white/30 bg-linear-to-br from-white/10 via-white/10 to-zinc-500/30 px-3 py-1.5 pr-4 text-[1.3125rem] font-medium text-white/90 shadow-[-30px_-30px_100px_0px_rgba(214,214,214,0.2)] whitespace-nowrap">
                {labels?.[i] ?? `Section ${i + 1}`}
              </span>
              <span
                className="absolute left-full top-1/2 h-0 w-0 -translate-y-1/2 border-y-[6px] border-l-[8px] border-y-transparent border-l-zinc-500/30"
                style={{ filter: "brightness(0.9)" }}
              />
            </span>
            <button
              onClick={() => onChange(i)}
              className={`block h-3 w-3 md:h-6 md:w-6 shrink-0 rounded-full transition-all ${
                i === active ? "bg-zinc-300 scale-125" : "bg-zinc-600 hover:bg-[#8D2409]"
              }`}
              aria-label={labels?.[i] ?? `Go to section ${i + 1}`}
            />
          </li>
        ))}
      </ul>
    </nav>
  )
}
