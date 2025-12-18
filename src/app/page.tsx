"use client"

import { useEffect, useRef, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { LobbyScene } from "@/components/lobby-scene"
import { RedoubtScene } from "@/components/redoubt-scene"
import { LoadingScreen } from "@/components/loading-screen"
import { NavigationDots } from "@/components/navigation-dots"
import { Sidebar } from "@/components/sidebar"
import { ScrollIndicator } from "@/components/scroll-indicator"
import type { ViewMode } from "@/types/view-mode"
import { DrawerPanel } from "@/components/drawer-panel"

export default function Page() {
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>("lobby")
  const [currentSection, setCurrentSection] = useState(0)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isGPRActive, setIsGPRActive] = useState(false)
  const isScrollingRef = useRef(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 8000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (isLoading) return

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (isScrollingRef.current) return

      const delta = e.deltaY
      const maxSections = viewMode === "lobby" ? 7 : 4

      if (delta > 0) {
        isScrollingRef.current = true
        setCurrentSection((prev) => (prev < maxSections - 1 ? prev + 1 : 0))
        setTimeout(() => {
          isScrollingRef.current = false
        }, 800)
      } else if (delta < 0) {
        isScrollingRef.current = true
        setCurrentSection((prev) => (prev > 0 ? prev - 1 : maxSections - 1))
        setTimeout(() => {
          isScrollingRef.current = false
        }, 800)
      }
    }

    window.addEventListener("wheel", handleWheel, { passive: false })
    return () => window.removeEventListener("wheel", handleWheel)
  }, [isLoading, currentSection, viewMode])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth - 0.5
      const y = e.clientY / window.innerHeight - 0.5
      setMousePosition({ x, y })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const handleEnterRedoubt = (redoubt: ViewMode) => {
    if (redoubt === "redoubt-5" || redoubt === "coming-soon") {
      return
    }
    setViewMode(redoubt)
    setCurrentSection(0)
    setIsGPRActive(false)
  }

  const handleBackToLobby = () => {
    setViewMode("lobby")
    setCurrentSection(0)
    setIsGPRActive(false)
  }

  const handleToggleGPR = () => {
    setIsGPRActive((prev) => !prev)
  }

  return (
    <div
      className={`relative h-screen w-full overflow-hidden ${
        viewMode === "redoubt-4"
          ? "bg-linear-to-b from-[#0b1b3f] via-[#2f69b1] to-[#cfe9ff]"
          : "bg-black"
      }`}
    >
      <div className="fixed inset-0 z-0">
        <Canvas camera={{ position: [0, 2, 8], fov: 75 }} gl={{ alpha: true, antialias: true }}>
          {viewMode === "lobby" ? (
            <LobbyScene section={currentSection} mousePosition={mousePosition} />
          ) : (
            <RedoubtScene
              type={viewMode}
              section={currentSection}
              mousePosition={mousePosition}
              isGPRActive={isGPRActive}
            />
          )}
        </Canvas>
      </div>

      {/* Vignette overlay */}
      <div className="pointer-events-none fixed inset-0 z-10 opacity-50 bg-[radial-gradient(ellipse_at_center,transparent_50%,black_100%)]" />

      {/* Hamburger menu */}
      <button
        className="fixed left-4 top-4 z-50 text-3xl text-white transition-transform hover:scale-110"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label="Toggle menu"
      >
        ☰
      </button>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onBackToLobby={handleBackToLobby}
        viewMode={viewMode}
      />

      <div
        className="relative z-20 transition-transform duration-1000 ease-in-out"
        style={{
          transform: `translateY(-${currentSection * 100}vh)`,
        }}
      >
        {viewMode === "lobby" ? (
          <>
            {/* Section 0: Hero/Intro */}
            <section className="relative flex h-screen items-center justify-center text-center">
              <div className="fade-in-up max-w-6xl px-8">
                <h1 className="mb-12 text-8xl font-bold uppercase text-white">
                  West Point <span className="text-[#8B4513]">Redoubts</span>
                </h1>
                <p className="mb-16 text-3xl font-medium text-white/70">
                  Step into history. Explore Revolutionary War fortifications.
                </p>
                <button
                  onClick={() => setCurrentSection(1)}
                  className="scale-125 rounded-3xl border-2 border-white bg-white/10 px-8 py-4 font-bold text-[#8B4513] shadow-[10px_10px_100px_0px_rgba(219,219,219,0.44)] backdrop-blur-md transition-all hover:scale-150 hover:text-white"
                >
                  Begin Journey
                </button>
              </div>
            </section>

            {/* Section 1: Maps of West Point */}
            <section className="relative flex h-screen items-center justify-start px-16">
              <div className="w-96 min-h-[70vh] rounded-[40px] border-2 border-white/30 bg-gradient-to-br from-white/10 via-white/10 to-zinc-500/30 p-12 shadow-[-30px_-30px_100px_0px_rgba(214,214,214,0.2)] backdrop-blur-[20px]">
                <h2 className="mb-6 text-3xl font-bold uppercase text-white/70">Aerial Map of West Point</h2>
                <p className="text-white">
                Redoubt 2, Redoubt 4, Fort Clinton, and Fort Putnam Landmarks Pinned on Google Aerial Satellite Imagery from May 2025.
                </p>
              </div>
            </section>

            {/* Section 2: Greenleaf Plan (opposite-facing map) */}
            <section className="relative flex h-screen items-center justify-start px-16">
              <div className="w-96 min-h-[70vh] rounded-[40px] border-2 border-white/30 bg-gradient-to-br from-white/10 via-white/10 to-zinc-500/30 p-12 shadow-[-30px_-30px_100px_0px_rgba(214,214,214,0.2)] backdrop-blur-[20px]">
                <h2 className="mb-6 text-3xl font-bold uppercase text-white/70">Captain Greenleaf’s Plan</h2>
                <p className="text-white">
                  A drawn plan belonging to Captain Moses Greenleaf of the 11th Regiment, who commanded Fort Putnam in the year 1779–1780.
                </p>
              </div>
            </section>

            {/* Section 3: Redoubt 4 */}
            <section className="relative flex h-screen items-center justify-start px-16">
              <div className="w-96 min-h-[70vh] rounded-[40px] border-2 border-white/30 bg-gradient-to-br from-white/10 via-white/10 to-zinc-500/30 p-12 shadow-[-30px_-30px_100px_0px_rgba(214,214,214,0.2)] backdrop-blur-[20px]">
                <h2 className="mb-6 text-5xl font-bold uppercase text-white/70">Redoubt 4</h2>
                <p className="mb-8 text-white">
                  A critical earthwork fortification positioned along the southern defensive line of West Point. Built
                  in 1778-1779, Redoubt 4 was part of the comprehensive defensive system protecting the Hudson River
                  highlands and played a vital role in securing this strategic military position.
                </p>
                <button
                  onClick={() => handleEnterRedoubt("redoubt-4")}
                  className="rounded-2xl border-2 border-white bg-white/10 px-8 py-4 font-bold text-[#fff] shadow-[10px_10px_100px_0px_rgba(219,219,219,0.44)] backdrop-blur-md transition-all hover:scale-105 hover:text-white"
                >
                  Enter Site →
                </button>
                <DrawerPanel variant="site1" />
              </div>
            </section>

            {/* Section 4: Redoubt 5 - Under Construction */}
            <section className="relative flex h-screen items-center justify-start px-16">
              <div className="w-96 min-h-[70vh] rounded-[40px] border-2 border-white/30 bg-gradient-to-br from-white/10 via-white/10 to-zinc-500/30 p-12 shadow-[-30px_-30px_100px_0px_rgba(214,214,214,0.2)] backdrop-blur-[20px]">
                <h2 className="mb-6 text-5xl font-bold uppercase text-white/70">Redoubt 5</h2>
                <div className="mb-6 inline-block rounded-lg bg-yellow-500/20 px-4 py-2 text-sm font-bold uppercase text-yellow-300">
                  Under Construction
                </div>
                <p className="mb-8 text-white">
                  Another key fortification in West Point's defensive network, positioned to provide interlocking fields
                  of fire with adjacent redoubts. The digital reconstruction and interactive features for this site are
                  currently in development.
                </p>
                <button
                  disabled
                  className="cursor-not-allowed rounded-2xl border-2 border-white/30 bg-white/5 px-8 py-4 font-bold text-white/30 opacity-50"
                >
                  Coming Soon
                </button>
                <DrawerPanel />
              </div>
            </section>

            {/* Section 5: Coming Soon */}
            <section className="relative flex h-screen items-center justify-start px-16">
              <div className="w-96 min-h-[70vh] rounded-[40px] border-2 border-white/30 bg-gradient-to-br from-white/10 via-white/10 to-zinc-500/30 p-12 shadow-[-30px_-30px_100px_0px_rgba(214,214,214,0.2)] backdrop-blur-[20px]">
                <h2 className="mb-6 text-5xl font-bold uppercase text-white/70">Additional Sites</h2>
                <div className="mb-6 inline-block rounded-lg bg-yellow-500/20 px-4 py-2 text-sm font-bold uppercase text-yellow-300">
                  Under Construction
                </div>
                <p className="mb-8 text-white">
                  More Revolutionary War heritage sites are being prepared for virtual exploration. Future additions
                  will include additional redoubts, fortifications, and archaeological features from the West Point
                  defensive complex.
                </p>
                <button
                  disabled
                  className="cursor-not-allowed rounded-2xl border-2 border-white/30 bg-white/5 px-8 py-4 font-bold text-white/30 opacity-50"
                >
                  Coming Soon
                </button>
                <DrawerPanel />
              </div>
            </section>

            {/* Section 6: About */}
            <section className="relative flex h-screen items-center justify-start px-16">
              <div className="w-96 min-h-[70vh] rounded-[40px] border-2 border-white/30 bg-gradient-to-br from-white/10 via-white/10 to-zinc-500/30 p-12 shadow-[-30px_-30px_100px_0px_rgba(214,214,214,0.2)] backdrop-blur-[20px]">
                <h2 className="mb-6 text-5xl font-bold uppercase text-white/70">Cultural Heritage</h2>
                <p className="mb-6 text-white">
                  These Revolutionary War earthwork fortifications at West Point, NY represent critical defensive
                  positions during the American Revolution.
                </p>
                <p className="text-white/80">
                  Built in 1778-1779, these redoubts protected the strategic Hudson River valley and helped secure
                  American independence.
                </p>
              </div>
            </section>
          </>
        ) : (
          <>
            {/* Redoubt Detail Sections */}
            <section className="relative flex h-screen items-center justify-start px-16">
              <div className="w-96 min-h-[70vh] rounded-[40px] border-2 border-white/30 bg-gradient-to-br from-white/10 via-white/10 to-zinc-500/30 p-12 shadow-[-30px_-30px_100px_0px_rgba(214,214,214,0.2)] backdrop-blur-[20px]">
                <h2 className="mb-6 text-5xl font-bold uppercase text-white/70">
                  {viewMode === "redoubt-4" && "Main Earthwork Rampart"}
                  {viewMode === "redoubt-5" && "Front Glacis"}
                  {viewMode === "coming-soon" && "V-Shaped Salient"}
                </h2>
                <p className="mb-6 text-white">
                  {viewMode === "redoubt-4" &&
                    "The primary defensive wall, constructed from packed earth and reinforced with timber. This rampart provided protection from artillery fire while offering elevated firing positions for defenders."}
                  {viewMode === "redoubt-5" &&
                    "The glacis slope provided a clear field of fire while exposing attackers. This open approach made assault extremely dangerous, forcing attackers to advance uphill under constant fire."}
                  {viewMode === "coming-soon" &&
                    "The distinctive V-shaped design created overlapping fields of fire. This angular configuration allowed defenders to engage attackers from multiple directions simultaneously."}
                </p>
                {viewMode === "redoubt-4" && (
                  <button
                    onClick={handleToggleGPR}
                    className="mb-4 rounded-2xl border-2 border-[#00ff00] bg-[#00ff00]/10 px-6 py-3 font-bold text-[#00ff00] transition-all hover:scale-105 hover:bg-[#00ff00]/20"
                  >
                    {isGPRActive ? "Hide GPR Data" : "View GPR Scan"}
                  </button>
                )}
                <button
                  onClick={handleBackToLobby}
                  className="rounded-2xl border-2 border-white bg-white/10 px-6 py-3 font-bold text-[#8B4513] transition-all hover:scale-105 hover:text-white"
                >
                  ← Back to Lobby
                </button>
              </div>
            </section>

            <section className="relative flex h-screen items-center justify-start px-16">
              <div className="w-96 min-h-[70vh] rounded-[40px] border-2 border-white/30 bg-gradient-to-br from-white/10 via-white/10 to-zinc-500/30 p-12 shadow-[-30px_-30px_100px_0px_rgba(214,214,214,0.2)] backdrop-blur-[20px]">
                <h3 className="mb-6 text-4xl font-bold uppercase text-white/70">
                  {viewMode === "redoubt-4" && "Western Bastion"}
                  {viewMode === "redoubt-5" && "Breach Point"}
                  {viewMode === "coming-soon" && "Left Flank"}
                </h3>
                <p className="text-white">
                  {viewMode === "redoubt-4" &&
                    "This projecting bastion provided flanking fire along the western wall. Defenders stationed here could engage attackers attempting to scale the ramparts, creating a deadly crossfire."}
                  {viewMode === "redoubt-5" &&
                    "The eastern wall breach point where Hamilton's forces made their famous assault. Under cover of darkness, American troops stormed this section with unloaded muskets and fixed bayonets."}
                  {viewMode === "coming-soon" &&
                    "The left wing of the fleche extends to cover the approach from the west. This position allowed enfilade fire against any flanking maneuvers by attacking forces."}
                </p>
              </div>
            </section>

            <section className="relative flex h-screen items-center justify-start px-16">
              <div className="w-96 min-h-[70vh] rounded-[40px] border-2 border-white/30 bg-gradient-to-br from-white/10 via-white/10 to-zinc-500/30 p-12 shadow-[-30px_-30px_100px_0px_rgba(214,214,214,0.2)] backdrop-blur-[20px]">
                <h3 className="mb-6 text-4xl font-bold uppercase text-white/70">
                  {viewMode === "redoubt-4" && "Artillery Positions"}
                  {viewMode === "redoubt-5" && "Inner Parade Ground"}
                  {viewMode === "coming-soon" && "Right Flank"}
                </h3>
                <p className="text-white">
                  {viewMode === "redoubt-4" &&
                    "Strategic cannon emplacements commanding the Hudson River valley. These positions could engage ships, fortifications, and troop formations at considerable distance."}
                  {viewMode === "redoubt-5" &&
                    "The central assembly area where troops mustered and ammunition was stored. This space provided shelter from bombardment while allowing rapid deployment to defensive positions."}
                  {viewMode === "coming-soon" &&
                    "The right wing extends to control the eastern approach. Combined with the left flank, these positions created a killing zone in front of the fortification."}
                </p>
              </div>
            </section>

            <section className="relative flex h-screen items-center justify-start px-16">
              <div className="w-96 min-h-[70vh] rounded-[40px] border-2 border-white/30 bg-gradient-to-br from-white/10 via-white/10 to-zinc-500/30 p-12 shadow-[-30px_-30px_100px_0px_rgba(214,214,214,0.2)] backdrop-blur-[20px]">
                <h3 className="mb-6 text-4xl font-bold uppercase text-white/70">
                  {viewMode === "redoubt-4" && "Strategic Overview"}
                  {viewMode === "redoubt-5" && "Complete Fortification"}
                  {viewMode === "coming-soon" && "Tactical Analysis"}
                </h3>
                <p className="mb-6 text-white">
                  {viewMode === "redoubt-4" &&
                    "From this elevated perspective, the complete defensive system becomes clear. The redoubt's position on high ground provided commanding views and interlocking fire with adjacent fortifications."}
                  {viewMode === "redoubt-5" &&
                    "The complete structure reveals sophisticated military engineering. Each element—walls, bastions, ditches—worked together to create a formidable defensive position that required exceptional courage to assault."}
                  {viewMode === "coming-soon" &&
                    "The V-shaped geometry represents advanced 18th-century military engineering. This design maximized defensive firepower while minimizing the fortification's profile and construction requirements."}
                </p>
                <button
                  onClick={handleBackToLobby}
                  className="rounded-2xl border-2 border-white bg-white/10 px-6 py-3 font-bold text-[#8B4513] transition-all hover:scale-105 hover:text-white"
                >
                  ← Back to Lobby
                </button>
              </div>
            </section>
          </>
        )}
      </div>

      <NavigationDots total={viewMode === "lobby" ? 7 : 4} active={currentSection} onChange={setCurrentSection} />
      <ScrollIndicator />
      <LoadingScreen isVisible={isLoading} />
    </div>
  )
}
