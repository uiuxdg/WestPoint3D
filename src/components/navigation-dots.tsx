"use client"

interface NavigationDotsProps {
  total: number
  active: number
  onChange: (index: number) => void
}

export function NavigationDots({ total, active, onChange }: NavigationDotsProps) {
  return (
    <nav className="fixed right-8 top-1/2 z-40 -translate-y-1/2">
      <ul className="space-y-4">
        {Array.from({ length: total }).map((_, i) => (
          <li key={i}>
            <button
              onClick={() => onChange(i)}
              className={`block h-3 w-3 rounded-full transition-all ${
                i === active ? "bg-zinc-300 scale-125" : "bg-zinc-600 hover:bg-[#8D2409]"
              }`}
              aria-label={`Go to section ${i + 1}`}
            />
          </li>
        ))}
      </ul>
    </nav>
  )
}
