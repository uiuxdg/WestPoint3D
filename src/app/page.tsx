"use client"

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Canvas } from "@react-three/fiber"
import { LobbyScene } from "@/components/lobby-scene"
import { RedoubtScene } from "@/components/redoubt-scene"
import { LoadingScreen } from "@/components/loading-screen"
import { NavigationDots } from "@/components/navigation-dots"
import type { ViewMode } from "@/types/view-mode"
import { buildNavigationQuery, parseNavigationFromSearch } from "@/lib/navigation-url"
import { DrawerPanel } from "@/components/drawer-panel"
import { ImageViewerModal } from "@/components/image-viewer-modal"
import type { ImageViewerImage } from "@/components/image-viewer-modal"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Rotate3d } from "lucide-react"

export default function Page() {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const [viewMode, setViewMode] = useState<ViewMode>("lobby")
  const [currentSection, setCurrentSection] = useState(0)

  const applyNavigationFromSearch = useCallback((search: string) => {
    const parsed = parseNavigationFromSearch(new URLSearchParams(search))
    setViewMode(parsed.viewMode)
    setCurrentSection(parsed.section)
  }, [])

  useLayoutEffect(() => {
    applyNavigationFromSearch(window.location.search)
  }, [applyNavigationFromSearch])

  useEffect(() => {
    const onPopState = () => applyNavigationFromSearch(window.location.search)
    window.addEventListener("popstate", onPopState)
    return () => window.removeEventListener("popstate", onPopState)
  }, [applyNavigationFromSearch])

  const navigateTo = useCallback(
    (view: ViewMode, section: number) => {
      const q = buildNavigationQuery(view, section)
      const base = pathname || "/"
      setViewMode(view)
      setCurrentSection(section)
      router.push(`${base}?${q}`, { scroll: false })
    },
    [pathname, router],
  )

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isGPRActive, setIsGPRActive] = useState(false)
  const [viewerImage, setViewerImage] = useState<ImageViewerImage | null>(null)
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

  const openRedoubt4Site = () => {
    window.open("https://redoubtfour.commonwealthcultural.com", "_blank", "noopener,noreferrer")
  }

  const openRedoubt4Panorama = useCallback(() => {
    router.push("/panorama/redoubt-4", { scroll: false })
  }, [router])

  const handleBackToLobby = () => {
    setIsGPRActive(false)
    navigateTo("lobby", 0)
  }

  const handleToggleGPR = () => {
    setIsGPRActive((prev) => !prev)
  }

  const maxSections = viewMode === "lobby" ? 11 : 4
  const isLastSection = currentSection >= maxSections - 1
  const isFirstSection = currentSection === 0
  const goToNextSection = () => {
    if (currentSection >= maxSections - 1) return
    navigateTo(viewMode, currentSection + 1)
  }
  const goToPreviousSection = () => {
    if (currentSection <= 0) return
    navigateTo(viewMode, currentSection - 1)
  }

  const lobbySectionLabels = [
    "Home",
    "Aerial Map of West Point",
    "Captain Greenleaf's Plan",
    "Redoubt 4",
    "Fort Clinton",
    "Fort Putnam",
    "Redoubt 2",
    "Batteries",
    "Fort Webb",
    "Additional Sites",
    "Cultural Heritage",
  ]
  const redoubtSectionLabels = [
    viewMode === "redoubt-5" ? "Front Glacis" : "Main Earthwork Rampart",
    viewMode === "redoubt-5" ? "Breach Point" : "Western Bastion",
    viewMode === "redoubt-5" ? "Inner Parade Ground" : "Artillery Positions",
    viewMode === "redoubt-5" ? "Complete Fortification" : "Strategic Overview",
  ]
  const navigationLabels = viewMode === "lobby" ? lobbySectionLabels : redoubtSectionLabels

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
            <LobbyScene
              section={currentSection}
              mousePosition={mousePosition}
              onFrameClick={(url) => {
                if (url === "/images/redoubt4.png") {
                  openRedoubt4Panorama()
                  return
                }
                setViewerImage({ src: url, alt: "Frame image" })
              }}
              onLidarTourClick={openRedoubt4Panorama}
            />
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

      {/* Shared image viewer (drawer + picture frame clicks) */}
      <ImageViewerModal
        open={viewerImage !== null}
        image={viewerImage}
        onClose={() => setViewerImage(null)}
      />

      {/* Sidebar drawer (trigger disabled across devices) */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent
          side="left"
          className="pt-16 w-[min(88dvw,28vmin)] sm:w-[22vw] border-r-2 border-white/30 bg-linear-to-br from-white/90 via-zinc-200/90 to-white/90 shadow-[0.65vmin_0.65vmin_12vmin_0_rgba(209,209,209,0.44)]"
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
                {viewMode === "redoubt-5" && "Redoubt 2"}
                {viewMode === "coming-soon" && "Coming Soon"}
              </p>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <div
        className="relative z-20 pointer-events-none transition-transform duration-1000 ease-in-out"
        style={{
          transform: `translateY(-${currentSection * 100}vh)`,
        }}
      >
        {viewMode === "lobby" ? (
          <>
            {/* Section 0: Hero/Intro */}
            <section className="relative flex h-screen items-end md:items-center justify-center text-center px-4 md:px-8 pb-0">
              <div className="fade-in-up max-w-6xl pointer-events-auto">
                <h1 className="mb-6 md:mb-12 text-4xl md:text-8xl font-bold uppercase text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.55)] [font-family:var(--font-libre-baskerville),ui-serif,Georgia,serif]">
                  West Point <span className="text-red-600">Virtual Archive</span>
                </h1>
                <p className="mb-8 md:mb-16 text-lg md:text-3xl font-medium text-white/70 [font-family:var(--font-libre-baskerville),ui-serif,Georgia,serif]">
                  Step into history. Explore Revolutionary War fortifications.
                </p>
                <button
                  onClick={() => navigateTo("lobby", 1)}
                  className="w-full md:w-auto rounded-3xl border-2 border-blue-400/50 bg-blue-600 px-3 py-2 md:px-5 md:py-3 text-base md:text-xl font-bold text-white shadow-[0_0.5vmin_2vmin_0_rgba(37,99,235,0.45)] backdrop-blur-md transition-transform duration-300 hover:scale-105 hover:bg-blue-500"
                >
                  Begin Journey
                </button>
              </div>
            </section>

            {/* Section 1: Maps of West Point */}
            <section className="relative flex h-screen items-end md:items-start justify-start md:justify-start pl-0 pr-2 md:pr-16 pt-4 pb-0 md:pt-[12vh] md:pb-0">
              <Card className="pointer-events-auto w-full md:max-w-none md:w-[min(32dvw,42vw)] rounded-l-none rounded-tr-[2.6vmin] rounded-br-none md:rounded-r-[2.6vmin] border-2 border-l-0 border-b-0 md:border-b-2 border-white/20 h-auto flex flex-col md:flex-initial backdrop-blur-md bg-linear-to-br from-zinc-900/85 via-zinc-800/78 to-zinc-950/90 shadow-[0_1.2vmin_4vmin_0_rgba(0,0,0,0.42)]">
                <CardHeader className="pl-3 md:pl-6">
                  <CardTitle className="mb-0.5 text-2xl md:text-3xl font-bold uppercase text-white">Aerial Map of West Point</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 pl-0 pr-6 pb-5 md:pb-8">
                  <CardDescription className="pl-6 text-white text-sm md:text-xl leading-snug">
                    Redoubt 2, Redoubt 4, Fort Clinton, and Fort Putnam Landmarks Pinned on Google Aerial Satellite Imagery from May 2025.
                  </CardDescription>
                </CardContent>
                <CardFooter className="pt-0 pl-0 pr-0 pb-0 md:pb-4">
                  <div className="flex w-full mr-3 md:mr-6 rounded-l-none rounded-tr-2xl rounded-br-none md:rounded-r-2xl border-2 border-l-0 border-b-0 md:border-b-2 border-white/15 bg-zinc-950/55 overflow-hidden">
                    {!isFirstSection && (
                      <>
                        <button
                          onClick={goToPreviousSection}
                          className="flex-1 px-2 py-2.5 md:px-5 md:py-3 font-bold [font-family:var(--font-libre-baskerville),ui-serif,Georgia,serif] text-white text-xs md:text-base whitespace-nowrap transition-colors duration-300 bg-zinc-800/80 hover:bg-zinc-700"
                        >
                          ← Previous
                        </button>
                        <div className="w-[max(0.08vw,0.12vmin)] bg-white/30" />
                      </>
                    )}
                    {!isLastSection && (
                      <button
                        onClick={goToNextSection}
                        className={`${isFirstSection ? 'w-full' : 'flex-1'} px-2 py-2.5 md:px-5 md:py-3 font-bold [font-family:var(--font-libre-baskerville),ui-serif,Georgia,serif] text-white text-xs md:text-base whitespace-nowrap transition-colors duration-300 bg-blue-600 hover:bg-blue-500`}
                      >
                        Next →
                      </button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            </section>

            {/* Section 2: Greenleaf Plan (opposite-facing map) */}
            <section className="relative flex h-screen items-end md:items-start justify-start pl-0 pr-2 md:pr-16 pt-4 pb-0 md:pt-[12vh] md:pb-0">
              <Card className="pointer-events-auto w-full md:max-w-none md:w-[min(32dvw,42vw)] rounded-l-none rounded-tr-[2.6vmin] rounded-br-none md:rounded-r-[2.6vmin] border-2 border-l-0 border-b-0 md:border-b-2 border-white/20 h-auto flex flex-col md:flex-initial backdrop-blur-md bg-linear-to-br from-zinc-900/85 via-zinc-800/78 to-zinc-950/90 shadow-[0_1.2vmin_4vmin_0_rgba(0,0,0,0.42)]">
                <CardHeader className="pl-3 md:pl-6">
                  <CardTitle className="mb-0.5 text-2xl md:text-3xl font-bold uppercase text-white">Captain Greenleaf’s Plan</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 pl-0 pr-6 pb-5 md:pb-8">
                  <CardDescription className="pl-6 text-white text-sm md:text-xl leading-snug">
                    A drawn plan belonging to Captain Moses Greenleaf of the 11th Regiment, who commanded Fort Putnam in the year 1779–1780.
                  </CardDescription>
                  <a
                    href="https://www.masshist.org/database/1740"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 ml-6 inline-block rounded-md border border-red-500/40 bg-red-700 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-500"
                  >
                    Learn more about this map
                  </a>
                </CardContent>
                <CardFooter className="pt-0 pl-0 pr-0 pb-0 md:pb-4">
                  <div className="flex w-full mr-3 md:mr-6 rounded-l-none rounded-tr-2xl rounded-br-none md:rounded-r-2xl border-2 border-l-0 border-b-0 md:border-b-2 border-white/15 bg-zinc-950/55 overflow-hidden">
                    {!isFirstSection && (
                      <>
                        <button
                          onClick={goToPreviousSection}
                          className="flex-1 px-2 py-2.5 md:px-5 md:py-3 font-bold [font-family:var(--font-libre-baskerville),ui-serif,Georgia,serif] text-white text-xs md:text-base whitespace-nowrap transition-colors duration-300 bg-zinc-800/80 hover:bg-zinc-700"
                        >
                          ← Previous
                        </button>
                        <div className="w-[max(0.08vw,0.12vmin)] bg-white/30" />
                      </>
                    )}
                    {!isLastSection && (
                      <button
                        onClick={goToNextSection}
                        className={`${isFirstSection ? 'w-full' : 'flex-1'} px-2 py-2.5 md:px-5 md:py-3 font-bold [font-family:var(--font-libre-baskerville),ui-serif,Georgia,serif] text-white text-xs md:text-base whitespace-nowrap transition-colors duration-300 bg-blue-600 hover:bg-blue-500`}
                      >
                        Next →
                      </button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            </section>

            {/* Section 3: Redoubt 4 */}
            <section className="relative flex h-screen flex-row md:flex-col items-end md:items-start justify-start pl-0 pr-2 md:pr-16 pt-4 pb-0 md:pt-[12vh] md:pb-0 gap-2 md:gap-8">
              <Card className="pointer-events-auto order-1 w-full md:max-w-none md:w-[min(32dvw,42vw)] shrink-0 mt-0 md:mt-0 rounded-l-none rounded-tr-[2.6vmin] rounded-br-none md:rounded-r-[2.6vmin] border-2 border-l-0 border-b-0 md:border-b-2 border-white/20 h-auto flex flex-col md:flex-initial backdrop-blur-md bg-linear-to-br from-zinc-900/85 via-zinc-800/78 to-zinc-950/90 shadow-[0_1.2vmin_4vmin_0_rgba(0,0,0,0.42)]">
                <CardHeader className="p-2 pt-2 pr-2 pb-2 pl-3 md:p-6 md:pt-6 md:pr-6 md:pb-6 md:pl-6">
                  <CardTitle className="mb-0 md:mb-2 text-xl md:text-5xl font-bold uppercase text-white">Redoubt 4</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 pl-0 pr-3 pb-0 md:p-6 md:pt-0 md:pl-0 md:pr-6 md:pb-6">
                  <div className="flex flex-row gap-2 md:block mb-4 md:mb-6 items-start">
                    <div className="flex-1 min-w-0 max-w-[60%] md:max-w-none">
                      <p className="mb-0 pl-3 md:pl-6 pr-0 text-white text-sm md:text-xl leading-snug">
                        A critical earthwork fortification positioned along the southern defensive line of West Point. Built
                        in 1778-1779, Redoubt 4 was part of the comprehensive defensive system protecting the Hudson River
                        highlands and played a vital role in securing this strategic military position.
                      </p>
                    </div>
                    <div className="shrink-0 md:hidden flex items-start max-w-[45%]">
                      <div className="scale-[0.82] origin-bottom w-full max-w-full min-w-0">
                        <DrawerPanel variant="site1" onOpenImageViewer={(src, alt) => setViewerImage({ src, alt })} />
                      </div>
                    </div>
                  </div>
                  <div className="flex w-full rounded-l-none rounded-tr-2xl rounded-br-none md:rounded-r-2xl border-2 border-l-0 border-b-0 md:border-b-2 border-white/15 bg-zinc-950/55 overflow-hidden">
                    {!isFirstSection && (
                      <>
                        <button
                          onClick={goToPreviousSection}
                          className="flex-1 px-2 py-2.5 md:px-5 md:py-3 font-bold [font-family:var(--font-libre-baskerville),ui-serif,Georgia,serif] text-white text-xs md:text-base whitespace-nowrap transition-colors duration-300 bg-zinc-800/80 hover:bg-zinc-700"
                        >
                          ← Previous
                        </button>
                        <div className="w-[max(0.08vw,0.12vmin)] bg-white/30" />
                      </>
                    )}
                    <button
                      onClick={openRedoubt4Panorama}
                      className="flex-1 px-2 py-2.5 md:px-5 md:py-3 font-bold [font-family:var(--font-libre-baskerville),ui-serif,Georgia,serif] text-white text-xs md:text-base bg-blue-600 border-r-2 border-l-2 border-blue-400/45 transition-colors duration-300 hover:bg-blue-500 flex flex-col items-center justify-center gap-1"
                    >
                      <Rotate3d aria-hidden className="h-6 w-6 md:h-8 md:w-8 drop-shadow-[0_2px_6px_rgba(0,0,0,0.55)]" />
                      <span className="text-xs md:text-base whitespace-nowrap">View in 360°</span>
                    </button>
                    {!isLastSection && (
                      <>
                        <div className="w-[max(0.08vw,0.12vmin)] bg-white/30" />
                        <button
                          onClick={goToNextSection}
                          className="flex-1 px-2 py-2.5 md:px-5 md:py-3 font-bold [font-family:var(--font-libre-baskerville),ui-serif,Georgia,serif] text-white text-xs md:text-base whitespace-nowrap transition-colors duration-300 bg-zinc-800/80 hover:bg-zinc-700"
                        >
                          Next →
                        </button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
              <div className="hidden md:flex order-2 pt-0 md:pt-0 mt-0 w-[min(92dvw,50vmin)] md:w-full min-h-0 md:h-auto items-end justify-center md:items-start md:justify-start shrink-0 self-end md:self-auto">
                <div className="w-full max-w-[min(70vw,38vmin)] md:max-w-none md:w-[min(24vw,48vmin)] mx-auto md:mx-0 origin-bottom md:origin-top scale-[0.68] md:scale-75">
                  <DrawerPanel variant="site1" onOpenImageViewer={(src, alt) => setViewerImage({ src, alt })} />
                </div>
              </div>
            </section>

            {/* Section 4: Fort Clinton */}
            <section className="relative flex h-screen flex-row md:flex-col items-end md:items-start justify-start pl-0 pr-2 md:pr-16 pt-4 pb-0 md:pt-[12vh] md:pb-0 gap-2 md:gap-8">
              <Card className="pointer-events-auto order-1 w-full md:max-w-none md:w-[min(32dvw,42vw)] shrink-0 mt-0 md:mt-0 rounded-l-none rounded-tr-[2.6vmin] rounded-br-none md:rounded-r-[2.6vmin] border-2 border-l-0 border-b-0 md:border-b-2 border-white/20 h-auto flex flex-col md:flex-initial backdrop-blur-md bg-linear-to-br from-zinc-900/85 via-zinc-800/78 to-zinc-950/90 shadow-[0_1.2vmin_4vmin_0_rgba(0,0,0,0.42)]">
                <CardHeader className="p-2 pt-2 pr-2 pb-2 pl-3 md:p-6 md:pt-6 md:pr-6 md:pb-6 md:pl-6">
                  <CardTitle className="mb-0 md:mb-2 text-xl md:text-5xl font-bold uppercase text-white">Fort Clinton</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 pl-0 pr-3 pb-0 md:p-6 md:pt-0 md:pl-0 md:pr-6 md:pb-6">
                  <div className="flex flex-row gap-2 md:block mb-4 md:mb-6 items-start">
                    <div className="flex-1 min-w-0 max-w-[60%] md:max-w-none">
                      <div className="mb-3 md:mb-6 pl-3 md:pl-6">
                        <span className="inline-block rounded-lg border border-red-500/30 bg-red-600/20 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-bold uppercase text-red-200/90">
                          Archive under Construction
                        </span>
                      </div>
                      <p className="mb-0 pl-3 md:pl-6 pr-0 text-white text-sm md:text-xl leading-snug">
                    A key Hudson River fortification historically paired with Fort Putnam and integral to West Point’s defenses.
                    This section will include images, files, and research materials specific to Fort Clinton.
                  </p>
                    </div>
                    <div className="shrink-0 md:hidden flex items-start max-w-[45%]">
                      <div className="scale-[0.82] origin-bottom w-full max-w-full min-w-0">
                        <DrawerPanel variant="site2" onOpenImageViewer={(src, alt) => setViewerImage({ src, alt })} />
                      </div>
                    </div>
                  </div>
                  <div className="flex w-full rounded-l-none rounded-tr-2xl rounded-br-none md:rounded-r-2xl border-2 border-l-0 border-b-0 md:border-b-2 border-white/15 bg-zinc-950/55 overflow-hidden">
                    {!isFirstSection && (
                      <>
                        <button
                          onClick={goToPreviousSection}
                          className="flex-1 px-2 py-2.5 md:px-5 md:py-3 font-bold [font-family:var(--font-libre-baskerville),ui-serif,Georgia,serif] text-white text-xs md:text-base whitespace-nowrap transition-colors duration-300 bg-zinc-800/80 hover:bg-zinc-700"
                        >
                          ← Previous
                        </button>
                        <div className="w-[max(0.08vw,0.12vmin)] bg-white/30" />
                      </>
                    )}
                    <button
                      disabled
                      className={`${isFirstSection ? 'flex-1' : 'flex-1'} cursor-not-allowed px-2 py-2.5 md:px-5 md:py-3 font-bold [font-family:var(--font-libre-baskerville),ui-serif,Georgia,serif] text-white/30 text-xs md:text-base opacity-50`}
                    >
                      Coming Soon
                    </button>
                    {!isLastSection && (
                      <>
                        <div className="w-[max(0.08vw,0.12vmin)] bg-white/30" />
                        <button
                          onClick={goToNextSection}
                          className="flex-1 px-2 py-2.5 md:px-5 md:py-3 font-bold [font-family:var(--font-libre-baskerville),ui-serif,Georgia,serif] text-white text-xs md:text-base whitespace-nowrap transition-colors duration-300 bg-blue-600 hover:bg-blue-500"
                        >
                          Next →
                        </button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
              <div className="hidden md:flex order-2 pt-0 md:pt-0 mt-0 w-[min(92dvw,50vmin)] md:w-full min-h-0 md:h-auto items-end justify-center md:items-start md:justify-start shrink-0 self-end md:self-auto">
                <div className="w-full max-w-[min(70vw,38vmin)] md:max-w-none md:w-[min(24vw,48vmin)] mx-auto md:mx-0 origin-bottom md:origin-top scale-[0.68] md:scale-75">
                  <DrawerPanel variant="site2" onOpenImageViewer={(src, alt) => setViewerImage({ src, alt })} />
                </div>
              </div>
            </section>

            {/* Section 5: Fort Putnam */}
            <section className="relative flex h-screen flex-row md:flex-col items-end md:items-start justify-start pl-0 pr-2 md:pr-16 pt-4 pb-0 md:pt-[12vh] md:pb-0 gap-2 md:gap-8">
              <Card className="pointer-events-auto order-1 w-full md:max-w-none md:w-[min(32dvw,42vw)] shrink-0 mt-0 md:mt-0 rounded-l-none rounded-tr-[2.6vmin] rounded-br-none md:rounded-r-[2.6vmin] border-2 border-l-0 border-b-0 md:border-b-2 border-white/20 h-auto flex flex-col md:flex-initial backdrop-blur-md bg-linear-to-br from-zinc-900/85 via-zinc-800/78 to-zinc-950/90 shadow-[0_1.2vmin_4vmin_0_rgba(0,0,0,0.42)]">
                <CardHeader className="p-2 pt-2 pr-2 pb-2 pl-3 md:p-6 md:pt-6 md:pr-6 md:pb-6 md:pl-6">
                  <CardTitle className="mb-0 md:mb-2 text-xl md:text-5xl font-bold uppercase text-white">Fort Putnam</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 pl-0 pr-3 pb-0 md:p-6 md:pt-0 md:pl-0 md:pr-6 md:pb-6">
                  <div className="flex flex-row gap-2 md:block mb-4 md:mb-6 items-start">
                    <div className="flex-1 min-w-0 max-w-[60%] md:max-w-none">
                      <div className="mb-3 md:mb-6 pl-3 md:pl-6">
                        <span className="inline-block rounded-lg border border-red-500/30 bg-red-600/20 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-bold uppercase text-red-200/90">
                          Archive under Construction
                        </span>
                      </div>
                      <p className="mb-0 pl-3 md:pl-6 pr-0 text-white text-sm md:text-xl leading-snug">
                    A key Hudson River fortification historically paired with Fort Clinton, Fort Putnam was integral to West Point's
                    defenses. This section will include images, files, and research materials specific to Fort Putnam.
                  </p>
                    </div>
                    <div className="shrink-0 md:hidden flex items-start max-w-[45%]">
                      <div className="scale-[0.82] origin-bottom w-full max-w-full min-w-0">
                        <DrawerPanel variant="site3" onOpenImageViewer={(src, alt) => setViewerImage({ src, alt })} />
                      </div>
                    </div>
                  </div>
                  <div className="flex w-full mr-3 md:mr-6 rounded-l-none rounded-tr-2xl rounded-br-none md:rounded-r-2xl border-2 border-l-0 border-b-0 md:border-b-2 border-white/15 bg-zinc-950/55 overflow-hidden">
                    {!isFirstSection && (
                      <>
                        <button
                          onClick={goToPreviousSection}
                          className="flex-1 px-2 py-2.5 md:px-5 md:py-3 font-bold [font-family:var(--font-libre-baskerville),ui-serif,Georgia,serif] text-white text-xs md:text-base whitespace-nowrap transition-colors duration-300 bg-zinc-800/80 hover:bg-zinc-700"
                        >
                          ← Previous
                        </button>
                        <div className="w-[max(0.08vw,0.12vmin)] bg-white/30" />
                      </>
                    )}
                    <button
                      disabled
                      className={`${isFirstSection ? 'flex-1' : 'flex-1'} cursor-not-allowed px-2 py-2.5 md:px-5 md:py-3 font-bold [font-family:var(--font-libre-baskerville),ui-serif,Georgia,serif] text-white/30 text-xs md:text-base opacity-50`}
                    >
                      Coming Soon
                    </button>
                    {!isLastSection && (
                      <>
                        <div className="w-[max(0.08vw,0.12vmin)] bg-white/30" />
                        <button
                          onClick={goToNextSection}
                          className="flex-1 px-2 py-2.5 md:px-5 md:py-3 font-bold [font-family:var(--font-libre-baskerville),ui-serif,Georgia,serif] text-white text-xs md:text-base whitespace-nowrap transition-colors duration-300 bg-blue-600 hover:bg-blue-500"
                        >
                          Next →
                        </button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
              <div className="hidden md:flex order-2 pt-0 md:pt-0 mt-0 w-[min(92dvw,50vmin)] md:w-full min-h-0 md:h-auto items-end justify-center md:items-start md:justify-start shrink-0 self-end md:self-auto">
                <div className="w-full max-w-[min(70vw,38vmin)] md:max-w-none md:w-[min(24vw,48vmin)] mx-auto md:mx-0 origin-bottom md:origin-top scale-[0.68] md:scale-75">
                  <DrawerPanel variant="site3" onOpenImageViewer={(src, alt) => setViewerImage({ src, alt })} />
                </div>
              </div>
            </section>

            {/* Section 6: Redoubt 2 (formerly Redoubt 5) - Under Construction */}
            <section className="relative flex h-screen flex-row md:flex-col items-end md:items-start justify-start pl-0 pr-2 md:pr-16 pt-4 pb-0 md:pt-[12vh] md:pb-0 gap-2 md:gap-8">
              <Card className="pointer-events-auto order-1 w-full md:max-w-none md:w-[min(32dvw,42vw)] shrink-0 mt-0 md:mt-0 rounded-l-none rounded-tr-[2.6vmin] rounded-br-none md:rounded-r-[2.6vmin] border-2 border-l-0 border-b-0 md:border-b-2 border-white/20 h-auto flex flex-col md:flex-initial backdrop-blur-md bg-linear-to-br from-zinc-900/85 via-zinc-800/78 to-zinc-950/90 shadow-[0_1.2vmin_4vmin_0_rgba(0,0,0,0.42)]">
                <CardHeader className="p-2 pt-2 pr-2 pb-2 pl-3 md:p-6 md:pt-6 md:pr-6 md:pb-6 md:pl-6">
                  <CardTitle className="mb-0 md:mb-2 text-xl md:text-5xl font-bold uppercase text-white">Redoubt 2</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 pl-0 pr-3 pb-0 md:p-6 md:pt-0 md:pl-0 md:pr-6 md:pb-6">
                  <div className="flex flex-row gap-2 md:block mb-4 md:mb-6 items-start">
                    <div className="flex-1 min-w-0 max-w-[60%] md:max-w-none">
                      <div className="mb-3 md:mb-6 pl-3 md:pl-6">
                        <span className="inline-block rounded-lg border border-red-500/30 bg-red-600/20 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-bold uppercase text-red-200/90">
                          Archive under Construction
                        </span>
                      </div>
                      <p className="mb-0 pl-3 md:pl-6 pr-0 text-white text-sm md:text-xl leading-snug">
                    Another key fortification in West Point's defensive network, positioned to provide interlocking fields
                    of fire with adjacent redoubts. The digital reconstruction and interactive features for this site are
                    currently in development.
                  </p>
                    </div>
                    <div className="shrink-0 md:hidden flex items-start max-w-[45%]">
                      <div className="scale-[0.82] origin-bottom w-full max-w-full min-w-0">
                        <DrawerPanel />
                      </div>
                    </div>
                  </div>
                  <div className="flex w-full rounded-l-none rounded-tr-2xl rounded-br-none md:rounded-r-2xl border-2 border-l-0 border-b-0 md:border-b-2 border-white/15 bg-zinc-950/55 overflow-hidden">
                    {!isFirstSection && (
                      <>
                        <button
                          onClick={goToPreviousSection}
                          className="flex-1 px-2 py-2.5 md:px-5 md:py-3 font-bold [font-family:var(--font-libre-baskerville),ui-serif,Georgia,serif] text-white text-xs md:text-base whitespace-nowrap transition-colors duration-300 bg-zinc-800/80 hover:bg-zinc-700"
                        >
                          ← Previous
                        </button>
                        <div className="w-[max(0.08vw,0.12vmin)] bg-white/30" />
                      </>
                    )}
                    <button
                      disabled
                      className={`${isFirstSection ? 'flex-1' : 'flex-1'} cursor-not-allowed px-2 py-2.5 md:px-5 md:py-3 font-bold [font-family:var(--font-libre-baskerville),ui-serif,Georgia,serif] text-white/30 text-xs md:text-base opacity-50`}
                    >
                      Coming Soon
                    </button>
                    {!isLastSection && (
                      <>
                        <div className="w-[max(0.08vw,0.12vmin)] bg-white/30" />
                        <button
                          onClick={goToNextSection}
                          className="flex-1 px-2 py-2.5 md:px-5 md:py-3 font-bold [font-family:var(--font-libre-baskerville),ui-serif,Georgia,serif] text-white text-xs md:text-base whitespace-nowrap transition-colors duration-300 bg-blue-600 hover:bg-blue-500"
                        >
                          Next →
                        </button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
              <div className="hidden md:flex order-2 pt-0 md:pt-0 mt-0 w-[min(92dvw,50vmin)] md:w-full min-h-0 md:h-auto items-end justify-center md:items-start md:justify-start shrink-0 self-end md:self-auto">
                <div className="w-full max-w-[min(70vw,38vmin)] md:max-w-none md:w-[min(24vw,48vmin)] mx-auto md:mx-0 origin-bottom md:origin-top scale-[0.68] md:scale-75">
                  <DrawerPanel />
                </div>
              </div>
            </section>

            {/* Section 7: Batteries */}
            <section className="relative flex h-screen flex-row md:flex-col items-end md:items-start justify-start pl-0 pr-2 md:pr-16 pt-4 pb-0 md:pt-[12vh] md:pb-0 gap-2 md:gap-8">
              <Card className="pointer-events-auto order-1 w-full md:max-w-none md:w-[min(32dvw,42vw)] shrink-0 mt-0 md:mt-0 rounded-l-none rounded-tr-[2.6vmin] rounded-br-none md:rounded-r-[2.6vmin] border-2 border-l-0 border-b-0 md:border-b-2 border-white/20 h-auto flex flex-col md:flex-initial backdrop-blur-md bg-linear-to-br from-zinc-900/85 via-zinc-800/78 to-zinc-950/90 shadow-[0_1.2vmin_4vmin_0_rgba(0,0,0,0.42)]">
                <CardHeader className="p-2 pt-2 pr-2 pb-2 pl-3 md:p-6 md:pt-6 md:pr-6 md:pb-6 md:pl-6">
                  <CardTitle className="mb-0 md:mb-2 text-xl md:text-5xl font-bold uppercase text-white">Batteries</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 pl-0 pr-3 pb-0 md:p-6 md:pt-0 md:pl-0 md:pr-6 md:pb-6">
                  <div className="flex flex-row gap-2 md:block mb-4 md:mb-6 items-start">
                    <div className="flex-1 min-w-0 max-w-[60%] md:max-w-none">
                      <div className="mb-3 md:mb-6 pl-3 md:pl-6">
                        <span className="inline-block rounded-lg border border-red-500/30 bg-red-600/20 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-bold uppercase text-red-200/90">
                          Archive under Construction
                        </span>
                      </div>
                      <p className="mb-0 pl-3 md:pl-6 pr-0 text-white text-sm md:text-xl leading-snug">
                    Artillery battery positions that supported West Point&apos;s defensive network. This section will include
                    images, files, and research materials specific to the batteries.
                  </p>
                    </div>
                    <div className="shrink-0 md:hidden flex items-start max-w-[45%]">
                      <div className="scale-[0.82] origin-bottom w-full max-w-full min-w-0">
                        <DrawerPanel />
                      </div>
                    </div>
                  </div>
                  <div className="flex w-full rounded-l-none rounded-tr-2xl rounded-br-none md:rounded-r-2xl border-2 border-l-0 border-b-0 md:border-b-2 border-white/15 bg-zinc-950/55 overflow-hidden">
                    {!isFirstSection && (
                      <>
                        <button
                          onClick={goToPreviousSection}
                          className="flex-1 px-2 py-2.5 md:px-5 md:py-3 font-bold [font-family:var(--font-libre-baskerville),ui-serif,Georgia,serif] text-white text-xs md:text-base whitespace-nowrap transition-colors duration-300 bg-zinc-800/80 hover:bg-zinc-700"
                        >
                          ← Previous
                        </button>
                        <div className="w-[max(0.08vw,0.12vmin)] bg-white/30" />
                      </>
                    )}
                    <button
                      disabled
                      className={`${isFirstSection ? 'flex-1' : 'flex-1'} cursor-not-allowed px-2 py-2.5 md:px-5 md:py-3 font-bold [font-family:var(--font-libre-baskerville),ui-serif,Georgia,serif] text-white/30 text-xs md:text-base opacity-50`}
                    >
                      Coming Soon
                    </button>
                    {!isLastSection && (
                      <>
                        <div className="w-[max(0.08vw,0.12vmin)] bg-white/30" />
                        <button
                          onClick={goToNextSection}
                          className="flex-1 px-2 py-2.5 md:px-5 md:py-3 font-bold [font-family:var(--font-libre-baskerville),ui-serif,Georgia,serif] text-white text-xs md:text-base whitespace-nowrap transition-colors duration-300 bg-blue-600 hover:bg-blue-500"
                        >
                          Next →
                        </button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
              <div className="hidden md:flex order-2 pt-0 md:pt-0 mt-0 w-[min(92dvw,50vmin)] md:w-full min-h-0 md:h-auto items-end justify-center md:items-start md:justify-start shrink-0 self-end md:self-auto">
                <div className="w-full max-w-[min(70vw,38vmin)] md:max-w-none md:w-[min(24vw,48vmin)] mx-auto md:mx-0 origin-bottom md:origin-top scale-[0.68] md:scale-75">
                  <DrawerPanel />
                </div>
              </div>
            </section>

            {/* Section 8: Fort Webb */}
            <section className="relative flex h-screen flex-row md:flex-col items-end md:items-start justify-start pl-0 pr-2 md:pr-16 pt-4 pb-0 md:pt-[12vh] md:pb-0 gap-2 md:gap-8">
              <Card className="pointer-events-auto order-1 w-full md:max-w-none md:w-[min(32dvw,42vw)] shrink-0 mt-0 md:mt-0 rounded-l-none rounded-tr-[2.6vmin] rounded-br-none md:rounded-r-[2.6vmin] border-2 border-l-0 border-b-0 md:border-b-2 border-white/20 h-auto flex flex-col md:flex-initial backdrop-blur-md bg-linear-to-br from-zinc-900/85 via-zinc-800/78 to-zinc-950/90 shadow-[0_1.2vmin_4vmin_0_rgba(0,0,0,0.42)]">
                <CardHeader className="p-2 pt-2 pr-2 pb-2 pl-3 md:p-6 md:pt-6 md:pr-6 md:pb-6 md:pl-6">
                  <CardTitle className="mb-0 md:mb-2 text-xl md:text-5xl font-bold uppercase text-white">Fort Webb</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 pl-0 pr-3 pb-0 md:p-6 md:pt-0 md:pl-0 md:pr-6 md:pb-6">
                  <div className="flex flex-row gap-2 md:block mb-4 md:mb-6 items-start">
                    <div className="flex-1 min-w-0 max-w-[60%] md:max-w-none">
                      <div className="mb-3 md:mb-6 pl-3 md:pl-6">
                        <span className="inline-block rounded-lg border border-red-500/30 bg-red-600/20 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-bold uppercase text-red-200/90">
                          Archive under Construction
                        </span>
                      </div>
                      <p className="mb-0 pl-3 md:pl-6 pr-0 text-white text-sm md:text-xl leading-snug">
                    A key fortification in the West Point defensive complex. This section will include images, files,
                    and research materials specific to Fort Webb.
                  </p>
                    </div>
                    <div className="shrink-0 md:hidden flex items-start max-w-[45%]">
                      <div className="scale-[0.82] origin-bottom w-full max-w-full min-w-0">
                        <DrawerPanel />
                      </div>
                    </div>
                  </div>
                  <div className="flex w-full rounded-l-none rounded-tr-2xl rounded-br-none md:rounded-r-2xl border-2 border-l-0 border-b-0 md:border-b-2 border-white/15 bg-zinc-950/55 overflow-hidden">
                    {!isFirstSection && (
                      <>
                        <button
                          onClick={goToPreviousSection}
                          className="flex-1 px-2 py-2.5 md:px-5 md:py-3 font-bold [font-family:var(--font-libre-baskerville),ui-serif,Georgia,serif] text-white text-xs md:text-base whitespace-nowrap transition-colors duration-300 bg-zinc-800/80 hover:bg-zinc-700"
                        >
                          ← Previous
                        </button>
                        <div className="w-[max(0.08vw,0.12vmin)] bg-white/30" />
                      </>
                    )}
                    <button
                      disabled
                      className={`${isFirstSection ? 'flex-1' : 'flex-1'} cursor-not-allowed px-2 py-2.5 md:px-5 md:py-3 font-bold [font-family:var(--font-libre-baskerville),ui-serif,Georgia,serif] text-white/30 text-xs md:text-base opacity-50`}
                    >
                      Coming Soon
                    </button>
                    {!isLastSection && (
                      <>
                        <div className="w-[max(0.08vw,0.12vmin)] bg-white/30" />
                        <button
                          onClick={goToNextSection}
                          className="flex-1 px-2 py-2.5 md:px-5 md:py-3 font-bold [font-family:var(--font-libre-baskerville),ui-serif,Georgia,serif] text-white text-xs md:text-base whitespace-nowrap transition-colors duration-300 bg-blue-600 hover:bg-blue-500"
                        >
                          Next →
                        </button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
              <div className="hidden md:flex order-2 pt-0 md:pt-0 mt-0 w-[min(92dvw,50vmin)] md:w-full min-h-0 md:h-auto items-end justify-center md:items-start md:justify-start shrink-0 self-end md:self-auto">
                <div className="w-full max-w-[min(70vw,38vmin)] md:max-w-none md:w-[min(24vw,48vmin)] mx-auto md:mx-0 origin-bottom md:origin-top scale-[0.68] md:scale-75">
                  <DrawerPanel />
                </div>
              </div>
            </section>

            {/* Section 9: Additional Sites */}
            <section className="relative flex h-screen flex-row md:flex-col items-end md:items-start justify-start pl-0 pr-2 md:pr-16 pt-4 pb-0 md:pt-[12vh] md:pb-0 gap-2 md:gap-8">
              <Card className="pointer-events-auto order-1 w-full md:max-w-none md:w-[min(32dvw,42vw)] shrink-0 mt-0 md:mt-0 rounded-l-none rounded-tr-[2.6vmin] rounded-br-none md:rounded-r-[2.6vmin] border-2 border-l-0 border-b-0 md:border-b-2 border-white/20 h-auto flex flex-col md:flex-initial backdrop-blur-md bg-linear-to-br from-zinc-900/85 via-zinc-800/78 to-zinc-950/90 shadow-[0_1.2vmin_4vmin_0_rgba(0,0,0,0.42)]">
                <CardHeader className="p-2 pt-2 pr-2 pb-2 pl-3 md:p-6 md:pt-6 md:pr-6 md:pb-6 md:pl-6">
                  <CardTitle className="mb-0 md:mb-2 text-xl md:text-5xl font-bold uppercase text-white">Additional Sites</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 pl-0 pr-3 pb-0 md:p-6 md:pt-0 md:pl-0 md:pr-6 md:pb-6">
                  <div className="flex flex-row gap-2 md:block mb-4 md:mb-6 items-start">
                    <div className="flex-1 min-w-0 max-w-[60%] md:max-w-none">
                      <div className="mb-3 md:mb-6 pl-3 md:pl-6">
                        <span className="inline-block rounded-lg border border-red-500/30 bg-red-600/20 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-bold uppercase text-red-200/90">
                          Archive under Construction
                        </span>
                      </div>
                      <p className="mb-0 pl-3 md:pl-6 pr-0 text-white text-sm md:text-xl leading-snug">
                    More Revolutionary War heritage sites are being prepared for virtual exploration. Future additions
                    will include additional redoubts, fortifications, and archaeological features from the West Point
                    defensive complex.
                  </p>
                    </div>
                    <div className="shrink-0 md:hidden flex items-start max-w-[45%]">
                      <div className="scale-[0.82] origin-bottom w-full max-w-full min-w-0">
                        <DrawerPanel />
                      </div>
                    </div>
                  </div>
                  <div className="flex w-full mr-3 md:mr-6 rounded-l-none rounded-tr-2xl rounded-br-none md:rounded-r-2xl border-2 border-l-0 border-b-0 md:border-b-2 border-white/15 bg-zinc-950/55 overflow-hidden">
                    {!isFirstSection && (
                      <>
                        <button
                          onClick={goToPreviousSection}
                          className="flex-1 px-2 py-2.5 md:px-5 md:py-3 font-bold [font-family:var(--font-libre-baskerville),ui-serif,Georgia,serif] text-white text-xs md:text-base whitespace-nowrap transition-colors duration-300 bg-zinc-800/80 hover:bg-zinc-700"
                        >
                          ← Previous
                        </button>
                        <div className="w-[max(0.08vw,0.12vmin)] bg-white/30" />
                      </>
                    )}
                    <button
                      disabled
                      className={`${isFirstSection ? 'flex-1' : 'flex-1'} cursor-not-allowed px-2 py-2.5 md:px-5 md:py-3 font-bold [font-family:var(--font-libre-baskerville),ui-serif,Georgia,serif] text-white/30 text-xs md:text-base opacity-50`}
                    >
                      Coming Soon
                    </button>
                    {!isLastSection && (
                      <>
                        <div className="w-[max(0.08vw,0.12vmin)] bg-white/30" />
                        <button
                          onClick={goToNextSection}
                          className="flex-1 px-2 py-2.5 md:px-5 md:py-3 font-bold [font-family:var(--font-libre-baskerville),ui-serif,Georgia,serif] text-white text-xs md:text-base whitespace-nowrap transition-colors duration-300 bg-blue-600 hover:bg-blue-500"
                        >
                          Next →
                        </button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
              <div className="hidden md:flex order-2 pt-0 md:pt-0 mt-0 w-[min(92dvw,50vmin)] md:w-full min-h-0 md:h-auto items-end justify-center md:items-start md:justify-start shrink-0 self-end md:self-auto">
                <div className="w-full max-w-[min(70vw,38vmin)] md:max-w-none md:w-[min(24vw,48vmin)] mx-auto md:mx-0 origin-bottom md:origin-top scale-[0.68] md:scale-75">
                  <DrawerPanel />
                </div>
              </div>
            </section>

            {/* Section 8: About */}
            <section className="relative flex h-screen items-end md:items-start justify-start pl-0 pr-4 md:pr-16 pt-4 pb-0 md:pt-[12vh] md:pb-0">
              <Card className="pointer-events-auto w-full md:max-w-none md:w-[min(32dvw,42vw)] rounded-l-none rounded-tr-[2.6vmin] rounded-br-none md:rounded-r-[2.6vmin] border-2 border-l-0 border-b-0 md:border-b-2 border-white/20 h-auto flex flex-col md:flex-initial backdrop-blur-md bg-linear-to-br from-zinc-900/85 via-zinc-800/78 to-zinc-950/90 shadow-[0_1.2vmin_4vmin_0_rgba(0,0,0,0.42)]">
                <CardHeader className="pl-3 md:pl-6">
                  <CardTitle className="mb-2 text-3xl md:text-5xl font-bold uppercase text-white">
                    Preserve the Story
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 pl-0 pr-6 pb-0 md:pb-6">
                  <p className="mb-4 md:mb-6 pl-6 text-white text-sm md:text-xl leading-snug">
                    The West Point Virtual Archive brings maps, models, scans, and research into one place—so these
                    landscapes can be explored, studied, and remembered.
                  </p>
                  <p className="pl-6 text-white text-sm md:text-xl leading-snug">
                    Every site adds context to the Hudson Highlands defenses. As new locations and datasets are added,
                    you&apos;ll be able to compare fortifications, follow the terrain, and see how the system worked as a
                    whole.
                  </p>
                </CardContent>
                <CardFooter className="pt-0 pl-0 pr-0 pb-0 md:pb-4">
                  <div className="flex w-full mr-3 md:mr-6 rounded-l-none rounded-tr-2xl rounded-br-none md:rounded-r-2xl border-2 border-l-0 border-b-0 md:border-b-2 border-white/15 bg-zinc-950/55 overflow-hidden">
                    {!isFirstSection && (
                      <>
                        <button
                          onClick={goToPreviousSection}
                          className="flex-1 px-2 py-2.5 md:px-5 md:py-3 font-bold [font-family:var(--font-libre-baskerville),ui-serif,Georgia,serif] text-white text-xs md:text-base whitespace-nowrap transition-colors duration-300 bg-zinc-800/80 hover:bg-zinc-700"
                        >
                          ← Previous
                        </button>
                        <div className="w-[max(0.08vw,0.12vmin)] bg-white/30" />
                      </>
                    )}
                    {isLastSection ? (
                      <button
                        onClick={() => navigateTo("lobby", 0)}
                        className={`${isFirstSection ? 'w-full' : 'flex-1'} px-2 py-2.5 md:px-5 md:py-3 font-bold [font-family:var(--font-libre-baskerville),ui-serif,Georgia,serif] text-white text-xs md:text-base whitespace-nowrap transition-colors duration-300 bg-blue-600 hover:bg-blue-500`}
                      >
                        Back to Home
                      </button>
                    ) : (
                      <button
                        onClick={goToNextSection}
                        className={`${isFirstSection ? 'w-full' : 'flex-1'} px-2 py-2.5 md:px-5 md:py-3 font-bold [font-family:var(--font-libre-baskerville),ui-serif,Georgia,serif] text-white text-xs md:text-base whitespace-nowrap transition-colors duration-300 bg-blue-600 hover:bg-blue-500`}
                      >
                        Next →
                      </button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            </section>
          </>
        ) : (
          <>
            {/* Redoubt Detail Sections */}
            <section className="relative flex h-screen items-start md:items-center justify-start pl-0 pr-4 md:pr-16 pt-4 pb-0 md:pt-0 md:pb-0">
              <Card className="pointer-events-auto w-full max-w-[min(92dvw,52vmin)] md:max-w-none md:w-[min(32dvw,42vw)] rounded-l-none rounded-tr-[2.6vmin] rounded-br-none md:rounded-r-[2.6vmin] border-2 border-l-0 border-b-0 md:border-b-2 border-white/20 h-auto flex flex-col md:flex-initial backdrop-blur-md bg-linear-to-br from-zinc-900/85 via-zinc-800/78 to-zinc-950/90 shadow-[0_1.2vmin_4vmin_0_rgba(0,0,0,0.42)]">
                <CardHeader className="pl-3 md:pl-6">
                  <CardTitle className="mb-2 text-3xl md:text-5xl font-bold uppercase text-white">
                    {viewMode === "redoubt-4" && "Main Earthwork Rampart"}
                    {viewMode === "redoubt-5" && "Front Glacis"}
                    {viewMode === "coming-soon" && "V-Shaped Salient"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 pl-0 pr-6 pb-0 md:pb-6">
                  <p className="mb-4 md:mb-6 pl-6 pr-0 text-white text-sm md:text-xl leading-snug">
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
                      className="mb-4 ml-6 w-full md:w-auto rounded-2xl border-2 border-[#00ff00] bg-[#00ff00]/10 px-6 py-3 font-bold text-[#00ff00] transition-transform duration-300 hover:scale-105 hover:bg-[#00ff00]/20"
                    >
                      {isGPRActive ? "Hide GPR Data" : "View GPR Scan"}
                    </button>
                  )}
                  <div className="flex w-full rounded-l-none rounded-tr-2xl rounded-br-none md:rounded-r-2xl border-2 border-l-0 border-b-0 md:border-b-2 border-white/15 bg-zinc-950/55 overflow-hidden">
                    {!isFirstSection && (
                      <>
                        <button
                          onClick={goToPreviousSection}
                          className="flex-1 px-6 py-3 font-bold [font-family:var(--font-libre-baskerville),ui-serif,Georgia,serif] text-white whitespace-nowrap transition-colors duration-300 bg-zinc-800/80 hover:bg-zinc-700"
                        >
                          ← Previous
                        </button>
                        <div className="w-[max(0.08vw,0.12vmin)] bg-white/30" />
                      </>
                    )}
                    {!isLastSection && (
                      <>
                        <button
                          onClick={goToNextSection}
                          className="flex-1 px-6 py-3 font-bold [font-family:var(--font-libre-baskerville),ui-serif,Georgia,serif] text-white whitespace-nowrap transition-colors duration-300 bg-blue-600 hover:bg-blue-500"
                        >
                          Next →
                        </button>
                        <div className="w-[max(0.08vw,0.12vmin)] bg-white/30" />
                      </>
                    )}
                    <button
                      onClick={handleBackToLobby}
                      className="flex-1 px-6 py-3 font-bold [font-family:var(--font-libre-baskerville),ui-serif,Georgia,serif] text-white whitespace-nowrap transition-colors duration-300 bg-blue-600 hover:bg-blue-500"
                    >
                      ← Back to Lobby
                    </button>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="relative flex h-screen items-start md:items-center justify-start pl-0 pr-4 md:pr-16 pt-4 pb-0 md:pt-0 md:pb-0">
              <Card className="pointer-events-auto w-full max-w-[min(92dvw,52vmin)] md:max-w-none md:w-[min(32dvw,42vw)] rounded-l-none rounded-tr-[2.6vmin] rounded-br-none md:rounded-r-[2.6vmin] border-2 border-l-0 border-b-0 md:border-b-2 border-white/20 h-auto flex flex-col md:flex-initial backdrop-blur-md bg-linear-to-br from-zinc-900/85 via-zinc-800/78 to-zinc-950/90 shadow-[0_1.2vmin_4vmin_0_rgba(0,0,0,0.42)]">
                <CardHeader className="pl-3 md:pl-6">
                  <CardTitle className="mb-2 text-2xl md:text-4xl font-bold uppercase text-white">
                    {viewMode === "redoubt-4" && "Western Bastion"}
                    {viewMode === "redoubt-5" && "Breach Point"}
                    {viewMode === "coming-soon" && "Left Flank"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 pl-0 pr-6 pb-0 md:pb-6">
                  <p className="pl-6 pr-0 text-white text-sm md:text-xl leading-snug">
                    {viewMode === "redoubt-4" &&
                      "This projecting bastion provided flanking fire along the western wall. Defenders stationed here could engage attackers attempting to scale the ramparts, creating a deadly crossfire."}
                    {viewMode === "redoubt-5" &&
                      "The eastern wall breach point where Hamilton's forces made their famous assault. Under cover of darkness, American troops stormed this section with unloaded muskets and fixed bayonets."}
                    {viewMode === "coming-soon" &&
                      "The left wing of the fleche extends to cover the approach from the west. This position allowed enfilade fire against any flanking maneuvers by attacking forces."}
                  </p>
                  <div className="flex w-full mr-3 md:mr-6 rounded-l-none rounded-tr-2xl rounded-br-none md:rounded-r-2xl border-2 border-l-0 border-b-0 md:border-b-2 border-white/15 bg-zinc-950/55 overflow-hidden md:mt-4">
                    {!isFirstSection && (
                      <>
                        <button
                          onClick={goToPreviousSection}
                          className="flex-1 px-6 py-3 font-bold [font-family:var(--font-libre-baskerville),ui-serif,Georgia,serif] text-white whitespace-nowrap transition-colors duration-300 bg-zinc-800/80 hover:bg-zinc-700"
                        >
                          ← Previous
                        </button>
                        <div className="w-[max(0.08vw,0.12vmin)] bg-white/30" />
                      </>
                    )}
                    {!isLastSection && (
                      <>
                        <button
                          onClick={goToNextSection}
                          className="flex-1 px-6 py-3 font-bold [font-family:var(--font-libre-baskerville),ui-serif,Georgia,serif] text-white whitespace-nowrap transition-colors duration-300 bg-blue-600 hover:bg-blue-500"
                        >
                          Next →
                        </button>
                        <div className="w-[max(0.08vw,0.12vmin)] bg-white/30" />
                      </>
                    )}
                    <button
                      onClick={handleBackToLobby}
                      className="flex-1 px-6 py-3 font-bold [font-family:var(--font-libre-baskerville),ui-serif,Georgia,serif] text-white whitespace-nowrap transition-colors duration-300 bg-blue-600 hover:bg-blue-500"
                    >
                      ← Back to Lobby
                    </button>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="relative flex h-screen items-start md:items-center justify-start pl-0 pr-4 md:pr-16 pt-4 pb-0 md:pt-0 md:pb-0">
              <Card className="pointer-events-auto w-full max-w-[min(92dvw,52vmin)] md:max-w-none md:w-[min(32dvw,42vw)] rounded-l-none rounded-tr-[2.6vmin] rounded-br-none md:rounded-r-[2.6vmin] border-2 border-l-0 border-b-0 md:border-b-2 border-white/20 h-auto flex flex-col md:flex-initial backdrop-blur-md bg-linear-to-br from-zinc-900/85 via-zinc-800/78 to-zinc-950/90 shadow-[0_1.2vmin_4vmin_0_rgba(0,0,0,0.42)]">
                <CardHeader className="pl-3 md:pl-6">
                  <CardTitle className="mb-2 text-2xl md:text-4xl font-bold uppercase text-white">
                    {viewMode === "redoubt-4" && "Artillery Positions"}
                    {viewMode === "redoubt-5" && "Inner Parade Ground"}
                    {viewMode === "coming-soon" && "Right Flank"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 pl-0 pr-6 pb-0 md:pb-6">
                  <p className="px-6 text-white text-sm md:text-xl leading-snug">
                    {viewMode === "redoubt-4" &&
                      "Strategic cannon emplacements commanding the Hudson River valley. These positions could engage ships, fortifications, and troop formations at considerable distance."}
                    {viewMode === "redoubt-5" &&
                      "The central assembly area where troops mustered and ammunition was stored. This space provided shelter from bombardment while allowing rapid deployment to defensive positions."}
                    {viewMode === "coming-soon" &&
                      "The right wing extends to control the eastern approach. Combined with the left flank, these positions created a killing zone in front of the fortification."}
                  </p>
                  <div className="flex w-full mr-3 md:mr-6 rounded-l-none rounded-tr-2xl rounded-br-none md:rounded-r-2xl border-2 border-l-0 border-b-0 md:border-b-2 border-white/15 bg-zinc-950/55 overflow-hidden md:mt-4">
                    {!isFirstSection && (
                      <>
                        <button
                          onClick={goToPreviousSection}
                          className="flex-1 px-6 py-3 font-bold [font-family:var(--font-libre-baskerville),ui-serif,Georgia,serif] text-white whitespace-nowrap transition-colors duration-300 bg-zinc-800/80 hover:bg-zinc-700"
                        >
                          ← Previous
                        </button>
                        <div className="w-[max(0.08vw,0.12vmin)] bg-white/30" />
                      </>
                    )}
                    {!isLastSection && (
                      <>
                        <button
                          onClick={goToNextSection}
                          className="flex-1 px-6 py-3 font-bold [font-family:var(--font-libre-baskerville),ui-serif,Georgia,serif] text-white whitespace-nowrap transition-colors duration-300 bg-blue-600 hover:bg-blue-500"
                        >
                          Next →
                        </button>
                        <div className="w-[max(0.08vw,0.12vmin)] bg-white/30" />
                      </>
                    )}
                    <button
                      onClick={handleBackToLobby}
                      className="flex-1 px-6 py-3 font-bold [font-family:var(--font-libre-baskerville),ui-serif,Georgia,serif] text-white whitespace-nowrap transition-colors duration-300 bg-blue-600 hover:bg-blue-500"
                    >
                      ← Back to Lobby
                    </button>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="relative flex h-screen items-start md:items-center justify-start pl-0 pr-4 md:pr-16 pt-4 pb-0 md:pt-0 md:pb-0">
              <Card className="pointer-events-auto w-full max-w-[min(92dvw,52vmin)] md:max-w-none md:w-[min(32dvw,42vw)] rounded-l-none rounded-tr-[2.6vmin] rounded-br-none md:rounded-r-[2.6vmin] border-2 border-l-0 border-b-0 md:border-b-2 border-white/20 h-auto flex flex-col md:flex-initial backdrop-blur-md bg-linear-to-br from-zinc-900/85 via-zinc-800/78 to-zinc-950/90 shadow-[0_1.2vmin_4vmin_0_rgba(0,0,0,0.42)]">
                <CardHeader className="pl-3 md:pl-6">
                  <CardTitle className="mb-2 text-2xl md:text-4xl font-bold uppercase text-white">
                    {viewMode === "redoubt-4" && "Strategic Overview"}
                    {viewMode === "redoubt-5" && "Complete Fortification"}
                    {viewMode === "coming-soon" && "Tactical Analysis"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 pl-0 pr-6 pb-0 md:pb-6">
                  <p className="mb-4 md:mb-6 pl-6 pr-0 text-white text-sm md:text-xl leading-snug">
                    {viewMode === "redoubt-4" &&
                      "From this elevated perspective, the complete defensive system becomes clear. The redoubt's position on high ground provided commanding views and interlocking fire with adjacent fortifications."}
                    {viewMode === "redoubt-5" &&
                      "The complete structure reveals sophisticated military engineering. Each element—walls, bastions, ditches—worked together to create a formidable defensive position that required exceptional courage to assault."}
                    {viewMode === "coming-soon" &&
                      "The V-shaped geometry represents advanced 18th-century military engineering. This design maximized defensive firepower while minimizing the fortification's profile and construction requirements."}
                  </p>
                  <div className="flex w-full rounded-l-none rounded-tr-2xl rounded-br-none md:rounded-r-2xl border-2 border-l-0 border-b-0 md:border-b-2 border-white/15 bg-zinc-950/55 overflow-hidden">
                    {!isFirstSection && (
                      <>
                        <button
                          onClick={goToPreviousSection}
                          className="flex-1 px-6 py-3 font-bold [font-family:var(--font-libre-baskerville),ui-serif,Georgia,serif] text-white whitespace-nowrap transition-colors duration-300 bg-zinc-800/80 hover:bg-zinc-700"
                        >
                          ← Previous
                        </button>
                        <div className="w-[max(0.08vw,0.12vmin)] bg-white/30" />
                      </>
                    )}
                    {!isLastSection && (
                      <>
                        <button
                          onClick={goToNextSection}
                          className="flex-1 px-6 py-3 font-bold [font-family:var(--font-libre-baskerville),ui-serif,Georgia,serif] text-white whitespace-nowrap transition-colors duration-300 bg-blue-600 hover:bg-blue-500"
                        >
                          Next →
                        </button>
                        <div className="w-[max(0.08vw,0.12vmin)] bg-white/30" />
                      </>
                    )}
                    <button
                      onClick={handleBackToLobby}
                      className="flex-1 px-6 py-3 font-bold [font-family:var(--font-libre-baskerville),ui-serif,Georgia,serif] text-white whitespace-nowrap transition-colors duration-300 bg-blue-600 hover:bg-blue-500"
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

      <NavigationDots
        total={viewMode === "lobby" ? 11 : 4}
        active={currentSection}
        onChange={(i) => navigateTo(viewMode, i)}
        labels={navigationLabels}
      />
      <LoadingScreen isVisible={isLoading} />
    </div>
  )
}
