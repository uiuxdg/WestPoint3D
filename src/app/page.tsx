"use client"

import { useEffect, useRef, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { LobbyScene } from "@/components/lobby-scene"
import { RedoubtScene } from "@/components/redoubt-scene"
import { LoadingScreen } from "@/components/loading-screen"
import { NavigationDots } from "@/components/navigation-dots"
import type { ViewMode } from "@/types/view-mode"
import { DrawerPanel } from "@/components/drawer-panel"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function Page() {
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>("lobby")
  const [currentSection, setCurrentSection] = useState(0)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isGPRActive, setIsGPRActive] = useState(false)
  const isScrollingRef = useRef(false)
  const viewModeRef = useRef<ViewMode>("lobby")
  const isLoadingRef = useRef(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 8000)
    return () => clearTimeout(timer)
  }, [])

  // Keep refs in sync with latest state without re-binding listeners
  useEffect(() => {
    viewModeRef.current = viewMode
  }, [viewMode])
  useEffect(() => {
    isLoadingRef.current = isLoading
  }, [isLoading])

  // Removed wheel-based navigation; sections now advance via explicit buttons

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

  const maxSections = viewMode === "lobby" ? 8 : 4
  const isLastSection = currentSection >= maxSections - 1
  const goToNextSection = () => {
    setCurrentSection((prev) => (prev < maxSections - 1 ? prev + 1 : prev))
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

      {/* Hamburger menu + shadcn Sheet */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetTrigger asChild>
          <button
            className="fixed left-4 top-4 z-50 text-3xl text-white transition-transform hover:scale-110"
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="pt-16 w-64 border-r-2 border-white/30 bg-linear-to-br from-white/90 via-zinc-200/90 to-white/90 shadow-[10px_10px_200px_0px_rgba(209,209,209,0.44)]"
        >
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              handleBackToLobby()
              setIsSidebarOpen(false)
            }}
            className="block px-6 py-4 text-2xl text-black transition-colors hover:text-zinc-600"
          >
            Home
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              setIsSidebarOpen(false)
            }}
            className="block px-6 py-4 text-2xl text-black transition-colors hover:text-zinc-600"
          >
            About
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              setIsSidebarOpen(false)
            }}
            className="block px-6 py-4 text-2xl text-black transition-colors hover:text-zinc-600"
          >
            History
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              setIsSidebarOpen(false)
            }}
            className="block px-6 py-4 text-2xl text-black transition-colors hover:text-zinc-600"
          >
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
        </SheetContent>
      </Sheet>

      <div
        className="relative z-20 transition-transform duration-1000 ease-in-out"
        style={{
          transform: `translateY(-${currentSection * 100}vh)`,
        }}
      >
        {viewMode === "lobby" ? (
          <>
            {/* Section 0: Hero/Intro */}
            <section className="relative flex h-screen items-end md:items-center justify-center text-center px-4 md:px-8 pb-6 md:pb-0">
              <div className="fade-in-up max-w-6xl">
                <h1 className="mb-6 md:mb-12 text-4xl md:text-8xl font-bold uppercase text-white">
                  West Point <span className="text-[#9e7252]">Virtual Archive</span>
                </h1>
                <p className="mb-8 md:mb-16 text-lg md:text-3xl font-medium text-white/70">
                  Step into history. Explore Revolutionary War fortifications.
                </p>
                <button
                  onClick={() => setCurrentSection(1)}
                  className="w-full md:w-auto rounded-3xl border-2 border-white bg-white/10 px-6 md:px-8 py-3 md:py-4 text-base md:text-xl font-bold text-[#9e7252] shadow-[10px_10px_100px_0px_rgba(219,219,219,0.44)] backdrop-blur-md transition-transform duration-300 hover:scale-105 hover:text-white"
                >
                  Begin Journey
                </button>
              </div>
            </section>

            {/* Section 1: Maps of West Point */}
            <section className="relative flex h-screen items-end md:items-center justify-center md:justify-start px-4 md:px-16 pb-4 md:pb-0">
              <Card className="w-full max-w-md md:w-96 min-h-[32vh] md:min-h-[70vh] rounded-[40px] border-2 border-white/30 bg-linear-to-br from-white/10 via-white/10 to-zinc-500/30 shadow-[-30px_-30px_100px_0px_rgba(214,214,214,0.2)]">
                <CardHeader>
                  <CardTitle className="mb-2 text-2xl md:text-3xl font-bold uppercase text-white/70">Aerial Map of West Point</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-white text-sm md:text-base">
                    Redoubt 2, Redoubt 4, Fort Clinton, and Fort Putnam Landmarks Pinned on Google Aerial Satellite Imagery from May 2025.
                  </CardDescription>
                </CardContent>
                <CardFooter className="pt-0">
                  {!isLastSection && (
                    <button
                      onClick={goToNextSection}
                      className="w-full md:w-auto rounded-2xl border-2 border-white bg-white/10 px-6 md:px-8 py-3 md:py-4 font-bold text-white transition-transform duration-300 hover:scale-105 hover:text-white"
                    >
                      Next →
                    </button>
                  )}
                </CardFooter>
              </Card>
            </section>

            {/* Section 2: Greenleaf Plan (opposite-facing map) */}
            <section className="relative flex h-screen items-end md:items-center justify-center md:justify-start px-4 md:px-16 pb-4 md:pb-0">
              <Card className="w-full max-w-md md:w-96 min-h-[32vh] md:min-h-[70vh] rounded-[40px] border-2 border-white/30 bg-linear-to-br from-white/10 via-white/10 to-zinc-500/30 shadow-[-30px_-30px_100px_0px_rgba(214,214,214,0.2)]">
                <CardHeader>
                  <CardTitle className="mb-2 text-2xl md:text-3xl font-bold uppercase text-white/70">Captain Greenleaf’s Plan</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-white text-sm md:text-base">
                    A drawn plan belonging to Captain Moses Greenleaf of the 11th Regiment, who commanded Fort Putnam in the year 1779–1780.
                  </CardDescription>
                </CardContent>
                <CardFooter className="pt-0">
                  {!isLastSection && (
                    <button
                      onClick={goToNextSection}
                      className="w-full md:w-auto rounded-2xl border-2 border-white bg-white/10 px-6 md:px-8 py-3 md:py-4 font-bold text-white transition-transform duration-300 hover:scale-105 hover:text-white"
                    >
                      Next →
                    </button>
                  )}
                </CardFooter>
              </Card>
            </section>

            {/* Section 3: Redoubt 4 */}
            <section className="relative flex h-screen flex-col justify-between md:justify-center items-center md:items-start px-4 md:px-16 py-4 md:py-0">
              <Card className="order-2 md:order-1 w-full max-w-md md:w-96 mt-0 md:mt-10 rounded-[40px] border-2 border-white/30 bg-linear-to-br from-white/10 via-white/10 to-zinc-500/30 shadow-[-30px_-30px_100px_0px_rgba(214,214,214,0.2)]">
                <CardHeader className="p-2 md:p-6">
                  <CardTitle className="mb-0 md:mb-2 text-xl md:text-5xl font-bold uppercase text-white/70">Redoubt 4</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
                  <p className="mb-4 md:mb-6 text-white text-sm md:text-base">
                    A critical earthwork fortification positioned along the southern defensive line of West Point. Built
                    in 1778-1779, Redoubt 4 was part of the comprehensive defensive system protecting the Hudson River
                    highlands and played a vital role in securing this strategic military position.
                  </p>
                  <div className="flex flex-row flex-wrap gap-3">
                    <button
                      onClick={() => handleEnterRedoubt("redoubt-4")}
                      className="w-auto rounded-2xl border-2 border-white bg-white/10 px-6 md:px-8 py-3 md:py-4 font-bold text-white transition-transform duration-300 hover:scale-105 hover:text-white"
                    >
                      Enter Site →
                    </button>
                    {!isLastSection && (
                      <button
                        onClick={goToNextSection}
                        className="w-auto rounded-2xl border-2 border-white bg-white/10 px-6 md:px-8 py-3 md:py-4 font-bold text-white transition-transform duration-300 hover:scale-105 hover:text-white"
                      >
                        Next →
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
              <div className="order-1 md:order-2 -mt-3 md:mt-3 h-[28vh] md:h-auto flex items-start justify-center md:flex md:justify-center">
                <div className="w-full max-w-md md:w-96 mx-auto origin-top scale-50 md:scale-75">
                  <DrawerPanel variant="site1" />
                </div>
              </div>
            </section>

            {/* Section 4: Redoubt 5 - Under Construction */}
            <section className="relative flex h-screen flex-col justify-between md:justify-center items-center md:items-start px-4 md:px-16 py-4 md:py-0">
              <Card className="order-2 md:order-1 w-full max-w-md md:w-96 mt-0 md:mt-10 rounded-[40px] border-2 border-white/30 bg-linear-to-br from-white/10 via-white/10 to-zinc-500/30 shadow-[-30px_-30px_100px_0px_rgba(214,214,214,0.2)]">
                <CardHeader className="p-2 md:p-6">
                  <CardTitle className="mb-0 md:mb-2 text-xl md:text-5xl font-bold uppercase text-white/70">Redoubt 5</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
                  <div className="mb-3 md:mb-6 inline-block rounded-lg bg-yellow-500/20 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-bold uppercase text-yellow-300">
                    Under Construction
                  </div>
                  <p className="mb-4 md:mb-6 text-white text-sm md:text-base">
                    Another key fortification in West Point's defensive network, positioned to provide interlocking fields
                    of fire with adjacent redoubts. The digital reconstruction and interactive features for this site are
                    currently in development.
                  </p>
                  <div className="flex flex-row flex-wrap gap-3">
                    <button
                      disabled
                      className="w-auto cursor-not-allowed rounded-2xl border-2 border-white/30 bg-white/5 px-6 md:px-8 py-3 md:py-4 font-bold text-white/30 opacity-50"
                    >
                      Coming Soon
                    </button>
                    {!isLastSection && (
                      <button
                        onClick={goToNextSection}
                        className="w-auto rounded-2xl border-2 border-white bg-white/10 px-6 md:px-8 py-3 md:py-4 font-bold text-white transition-transform duration-300 hover:scale-105 hover:text-white"
                      >
                        Next →
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
              <div className="order-1 md:order-2 -mt-3 md:mt-3 h-[28vh] md:h-auto flex items-start justify-center md:flex md:justify-center">
                <div className="w-full max-w-md md:w-96 mx-auto origin-top scale-50 md:scale-75">
                  <DrawerPanel />
                </div>
              </div>
            </section>

            {/* Section 5: Fort Clinton */}
            <section className="relative flex h-screen flex-col justify-between md:justify-center items-center md:items-start px-4 md:px-16 py-4 md:py-0">
              <Card className="order-2 md:order-1 w-full max-w-md md:w-96 mt-0 md:mt-10 rounded-[40px] border-2 border-white/30 bg-linear-to-br from-white/10 via-white/10 to-zinc-500/30 shadow-[-30px_-30px_100px_0px_rgba(214,214,214,0.2)]">
                <CardHeader className="p-2 md:p-6">
                  <CardTitle className="mb-0 md:mb-2 text-xl md:text-5xl font-bold uppercase text-white/70">Fort Clinton</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
                  <div className="mb-3 md:mb-6 inline-block rounded-lg bg-yellow-500/20 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-bold uppercase text-yellow-300">
                    Under Construction
                  </div>
                  <p className="mb-4 md:mb-6 text-white text-sm md:text-base">
                    A key Hudson River fortification historically paired with Fort Putnam and integral to West Point’s defenses.
                    This section will include images, files, and research materials specific to Fort Clinton.
                  </p>
                  <div className="flex flex-row flex-wrap gap-3">
                    <button
                      disabled
                      className="w-auto cursor-not-allowed rounded-2xl border-2 border-white/30 bg-white/5 px-6 md:px-8 py-3 md:py-4 font-bold text-white/30 opacity-50"
                    >
                      Coming Soon
                    </button>
                    {!isLastSection && (
                      <button
                        onClick={goToNextSection}
                        className="w-auto rounded-2xl border-2 border-white bg-white/10 px-6 md:px-8 py-3 md:py-4 font-bold text-white transition-transform duration-300 hover:scale-105 hover:text-white"
                      >
                        Next →
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
              <div className="order-1 md:order-2 -mt-3 md:mt-3 h-[28vh] md:h-auto flex items-start justify-center md:flex md:justify-center">
                <div className="w-full max-w-md md:w-96 mx-auto origin-top scale-50 md:scale-75">
                  <DrawerPanel variant="site2" />
                </div>
              </div>
            </section>

            {/* Section 6: Additional Sites */}
            <section className="relative flex h-screen flex-col justify-between md:justify-center items-center md:items-start px-4 md:px-16 py-4 md:py-0">
              <Card className="order-2 md:order-1 w-full max-w-md md:w-96 mt-0 md:mt-10 rounded-[40px] border-2 border-white/30 bg-linear-to-br from-white/10 via-white/10 to-zinc-500/30 shadow-[-30px_-30px_100px_0px_rgba(214,214,214,0.2)]">
                <CardHeader className="p-2 md:p-6">
                  <CardTitle className="mb-0 md:mb-2 text-xl md:text-5xl font-bold uppercase text-white/70">Additional Sites</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
                  <div className="mb-3 md:mb-6 inline-block rounded-lg bg-yellow-500/20 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-bold uppercase text-yellow-300">
                    Under Construction
                  </div>
                  <p className="mb-4 md:mb-6 text-white text-sm md:text-base">
                    More Revolutionary War heritage sites are being prepared for virtual exploration. Future additions
                    will include additional redoubts, fortifications, and archaeological features from the West Point
                    defensive complex.
                  </p>
                  <div className="flex flex-row flex-wrap gap-3">
                    <button
                      disabled
                      className="w-auto cursor-not-allowed rounded-2xl border-2 border-white/30 bg-white/5 px-6 md:px-8 py-3 md:py-4 font-bold text-white/30 opacity-50"
                    >
                      Coming Soon
                    </button>
                    {!isLastSection && (
                      <button
                        onClick={goToNextSection}
                        className="w-auto rounded-2xl border-2 border-white bg-white/10 px-6 md:px-8 py-3 md:py-4 font-bold text-white transition-transform duration-300 hover:scale-105 hover:text-white"
                      >
                        Next →
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
              <div className="order-1 md:order-2 -mt-3 md:mt-3 h-[28vh] md:h-auto flex items-start justify-center md:flex md:justify-center">
                <div className="w-full max-w-md md:w-96 mx-auto origin-top scale-50 md:scale-75">
                  <DrawerPanel />
                </div>
              </div>
            </section>

            {/* Section 7: About */}
            <section className="relative flex h-screen items-end md:items-center justify-center md:justify-start px-4 md:px-16 pb-4 md:pb-0">
              <Card className="w-full max-w-md md:w-96 min-h-[32vh] md:min-h-[70vh] rounded-[40px] border-2 border-white/30 bg-linear-to-br from-white/10 via-white/10 to-zinc-500/30 shadow-[-30px_-30px_100px_0px_rgba(214,214,214,0.2)]">
                <CardHeader>
                  <CardTitle className="mb-2 text-3xl md:text-5xl font-bold uppercase text-white/70">Cultural Heritage</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="mb-4 md:mb-6 text-white text-sm md:text-base">
                    These Revolutionary War earthwork fortifications at West Point, NY represent critical defensive
                    positions during the American Revolution.
                  </p>
                  <p className="text-white/80 text-sm md:text-base">
                    Built in 1778-1779, these redoubts protected the strategic Hudson River valley and helped secure
                    American independence.
                  </p>
                </CardContent>
                <CardFooter className="pt-0">
                  {!isLastSection && (
                    <button
                      onClick={goToNextSection}
                      className="w-full md:w-auto rounded-2xl border-2 border-white bg-white/10 px-6 md:px-8 py-3 md:py-4 font-bold text-white transition-transform duration-300 hover:scale-105 hover:text-white"
                    >
                      Next →
                    </button>
                  )}
                </CardFooter>
              </Card>
            </section>
          </>
        ) : (
          <>
            {/* Redoubt Detail Sections */}
            <section className="relative flex h-screen items-start md:items-center justify-center md:justify-start px-4 md:px-16 pt-4 md:pt-0">
              <Card className="w-full max-w-md md:w-96 min-h-[32vh] md:min-h-[70vh] rounded-[40px] border-2 border-white/30 bg-linear-to-br from-white/10 via-white/10 to-zinc-500/30 shadow-[-30px_-30px_100px_0px_rgba(214,214,214,0.2)]">
                <CardHeader>
                  <CardTitle className="mb-2 text-3xl md:text-5xl font-bold uppercase text-white/70">
                    {viewMode === "redoubt-4" && "Main Earthwork Rampart"}
                    {viewMode === "redoubt-5" && "Front Glacis"}
                    {viewMode === "coming-soon" && "V-Shaped Salient"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="mb-4 md:mb-6 text-white text-sm md:text-base">
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
                      className="mb-4 w-full md:w-auto rounded-2xl border-2 border-[#00ff00] bg-[#00ff00]/10 px-6 py-3 font-bold text-[#00ff00] transition-transform duration-300 hover:scale-105 hover:bg-[#00ff00]/20"
                    >
                      {isGPRActive ? "Hide GPR Data" : "View GPR Scan"}
                    </button>
                  )}
                  <div className="flex flex-row flex-wrap gap-3">
                    {!isLastSection && (
                      <button
                        onClick={goToNextSection}
                        className="w-auto rounded-2xl border-2 border-white bg-white/10 px-6 py-3 font-bold text-white transition-transform duration-300 hover:scale-105 hover:text-white"
                      >
                        Next →
                      </button>
                    )}
                    <button
                      onClick={handleBackToLobby}
                      className="w-auto rounded-2xl border-2 border-white bg-white/10 px-6 py-3 font-bold text-[#8B4513] transition-transform duration-300 hover:scale-105 hover:text-white"
                    >
                      ← Back to Lobby
                    </button>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="relative flex h-screen items-start md:items-center justify-center md:justify-start px-4 md:px-16 pt-4 md:pt-0">
              <Card className="w-full max-w-md md:w-96 min-h-[32vh] md:min-h-[70vh] rounded-[40px] border-2 border-white/30 bg-linear-to-br from-white/10 via-white/10 to-zinc-500/30 shadow-[-30px_-30px_100px_0px_rgba(214,214,214,0.2)]">
                <CardHeader>
                  <CardTitle className="mb-2 text-2xl md:text-4xl font-bold uppercase text-white/70">
                    {viewMode === "redoubt-4" && "Western Bastion"}
                    {viewMode === "redoubt-5" && "Breach Point"}
                    {viewMode === "coming-soon" && "Left Flank"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-white text-sm md:text-base">
                    {viewMode === "redoubt-4" &&
                      "This projecting bastion provided flanking fire along the western wall. Defenders stationed here could engage attackers attempting to scale the ramparts, creating a deadly crossfire."}
                    {viewMode === "redoubt-5" &&
                      "The eastern wall breach point where Hamilton's forces made their famous assault. Under cover of darkness, American troops stormed this section with unloaded muskets and fixed bayonets."}
                    {viewMode === "coming-soon" &&
                      "The left wing of the fleche extends to cover the approach from the west. This position allowed enfilade fire against any flanking maneuvers by attacking forces."}
                  </p>
                  {!isLastSection && (
                    <button
                      onClick={goToNextSection}
                      className="mt-4 w-full md:w-auto rounded-2xl border-2 border-white bg-white/10 px-6 py-3 font-bold text-white transition-transform duration-300 hover:scale-105 hover:text-white"
                    >
                      Next →
                    </button>
                  )}
                </CardContent>
              </Card>
            </section>

            <section className="relative flex h-screen items-start md:items-center justify-center md:justify-start px-4 md:px-16 pt-4 md:pt-0">
              <Card className="w-full max-w-md md:w-96 min-h-[32vh] md:min-h-[70vh] rounded-[40px] border-2 border-white/30 bg-linear-to-br from-white/10 via-white/10 to-zinc-500/30 shadow-[-30px_-30px_100px_0px_rgba(214,214,214,0.2)]">
                <CardHeader>
                  <CardTitle className="mb-2 text-2xl md:text-4xl font-bold uppercase text-white/70">
                    {viewMode === "redoubt-4" && "Artillery Positions"}
                    {viewMode === "redoubt-5" && "Inner Parade Ground"}
                    {viewMode === "coming-soon" && "Right Flank"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-white text-sm md:text-base">
                    {viewMode === "redoubt-4" &&
                      "Strategic cannon emplacements commanding the Hudson River valley. These positions could engage ships, fortifications, and troop formations at considerable distance."}
                    {viewMode === "redoubt-5" &&
                      "The central assembly area where troops mustered and ammunition was stored. This space provided shelter from bombardment while allowing rapid deployment to defensive positions."}
                    {viewMode === "coming-soon" &&
                      "The right wing extends to control the eastern approach. Combined with the left flank, these positions created a killing zone in front of the fortification."}
                  </p>
                  {!isLastSection && (
                    <button
                      onClick={goToNextSection}
                      className="mt-4 w-full md:w-auto rounded-2xl border-2 border-white bg-white/10 px-6 py-3 font-bold text-white transition-transform duration-300 hover:scale-105 hover:text-white"
                    >
                      Next →
                    </button>
                  )}
                </CardContent>
              </Card>
            </section>

            <section className="relative flex h-screen items-start md:items-center justify-center md:justify-start px-4 md:px-16 pt-4 md:pt-0">
              <Card className="w-full max-w-md md:w-96 min-h-[32vh] md:min-h-[70vh] rounded-[40px] border-2 border-white/30 bg-linear-to-br from-white/10 via-white/10 to-zinc-500/30 shadow-[-30px_-30px_100px_0px_rgba(214,214,214,0.2)]">
                <CardHeader>
                  <CardTitle className="mb-2 text-2xl md:text-4xl font-bold uppercase text-white/70">
                    {viewMode === "redoubt-4" && "Strategic Overview"}
                    {viewMode === "redoubt-5" && "Complete Fortification"}
                    {viewMode === "coming-soon" && "Tactical Analysis"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="mb-4 md:mb-6 text-white text-sm md:text-base">
                    {viewMode === "redoubt-4" &&
                      "From this elevated perspective, the complete defensive system becomes clear. The redoubt's position on high ground provided commanding views and interlocking fire with adjacent fortifications."}
                    {viewMode === "redoubt-5" &&
                      "The complete structure reveals sophisticated military engineering. Each element—walls, bastions, ditches—worked together to create a formidable defensive position that required exceptional courage to assault."}
                    {viewMode === "coming-soon" &&
                      "The V-shaped geometry represents advanced 18th-century military engineering. This design maximized defensive firepower while minimizing the fortification's profile and construction requirements."}
                  </p>
                  <div className="flex flex-row flex-wrap gap-3">
                    {!isLastSection && (
                      <button
                        onClick={goToNextSection}
                        className="w-auto rounded-2xl border-2 border-white bg-white/10 px-6 py-3 font-bold text-white transition-transform duration-300 hover:scale-105 hover:text-white"
                      >
                        Next →
                      </button>
                    )}
                    <button
                      onClick={handleBackToLobby}
                      className="w-auto rounded-2xl border-2 border-white bg-white/10 px-6 py-3 font-bold text-[#8B4513] transition-transform duration-300 hover:scale-105 hover:text-white"
                    >
                      ← Back to Lobby
                    </button>
                  </div>
                </CardContent>
              </Card>
            </section>
          </>
        )}
      </div>

      <NavigationDots total={viewMode === "lobby" ? 8 : 4} active={currentSection} onChange={setCurrentSection} />
      <LoadingScreen isVisible={isLoading} />
    </div>
  )
}
