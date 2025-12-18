"use client"

export function ScrollIndicator() {
  return (
    <div className="fixed bottom-4 left-1/2 z-30 -translate-x-1/2 animate-bounce">
      <svg
        className="h-8 w-8 text-zinc-600"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    </div>
  )
}
