"use client"

import type { ViewMode } from "@/types/view-mode"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  onBackToLobby: () => void
  viewMode: ViewMode
}

export function Sidebar({ isOpen, onClose, onBackToLobby, viewMode }: SidebarProps) {
  const handleBackToLobby = () => {
    onBackToLobby()
    onClose()
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 z-[9] bg-black/50 transition-opacity" onClick={onClose} />}

      {/* Sidebar */}
      <nav
        className={`fixed left-0 top-0 z-[100] h-full w-64 overflow-x-hidden border-r-2 border-white/30 bg-gradient-to-br from-white/90 via-zinc-200/90 to-white/90 pt-16 shadow-[10px_10px_200px_0px_rgba(209,209,209,0.44)] backdrop-blur-md transition-all duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault()
            handleBackToLobby()
          }}
          className="block px-6 py-4 text-2xl text-black transition-colors hover:text-zinc-600"
        >
          Home
        </a>
        <a href="#" className="block px-6 py-4 text-2xl text-black transition-colors hover:text-zinc-600">
          About
        </a>
        <a href="#" className="block px-6 py-4 text-2xl text-black transition-colors hover:text-zinc-600">
          History
        </a>
        <a href="#" className="block px-6 py-4 text-2xl text-black transition-colors hover:text-zinc-600">
          Contact
        </a>

        {viewMode !== "lobby" && (
          <div className="mt-8 border-t border-black/20 pt-4">
            <p className="px-6 py-2 text-sm font-bold uppercase text-zinc-600">Current Site</p>
            <p className="px-6 py-2 text-xl text-black">
              {viewMode === "redoubt-4" && "Redoubt 4"}
              {viewMode === "redoubt-5" && "Redoubt 5"}
              {viewMode === "coming-soon" && "Coming Soon"}
            </p>
          </div>
        )}
      </nav>
    </>
  )
}
