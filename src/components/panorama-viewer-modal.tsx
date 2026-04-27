"use client"

import * as React from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import * as THREE from "three"
import { ChevronLeft, ChevronRight } from "lucide-react"

export interface PanoramaImage {
  src: string
  alt: string
}

function clampIndex(idx: number, len: number) {
  if (len <= 0) return 0
  return ((idx % len) + len) % len
}

export function PanoramaViewerModal({
  open,
  images,
  initialIndex = 0,
  onClose,
}: {
  open: boolean
  images: PanoramaImage[]
  initialIndex?: number
  onClose: () => void
}) {
  const [index, setIndex] = React.useState(() => clampIndex(initialIndex, images.length))
  const [isLoading, setIsLoading] = React.useState(false)
  const [loadProgress, setLoadProgress] = React.useState(0)

  React.useEffect(() => {
    if (!open) return
    setIndex(clampIndex(initialIndex, images.length))
  }, [open, initialIndex, images.length])

  React.useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [open])

  const goPrev = React.useCallback(() => {
    if (!images.length) return
    setIndex((i) => clampIndex(i - 1, images.length))
  }, [images.length])

  const goNext = React.useCallback(() => {
    if (!images.length) return
    setIndex((i) => clampIndex(i + 1, images.length))
  }, [images.length])

  React.useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev()
      if (e.key === "ArrowRight") goNext()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, goPrev, goNext])

  const active = images[index]

  return (
    <Dialog.Root open={open} onOpenChange={(o) => (!o ? onClose() : null)}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-90 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out" />
        <Dialog.Content
          className="fixed inset-0 z-100 flex min-h-0 min-w-0 flex-col bg-black text-white outline-none"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-zinc-950/85 px-3 py-2 backdrop-blur-md md:px-4 md:py-3">
            <div className="min-w-0">
              <Dialog.Title className="truncate text-sm font-semibold md:text-base">
                {active?.alt ?? "Panorama"}
              </Dialog.Title>
              {images.length > 1 && (
                <div className="text-xs text-white/60">
                  {index + 1} / {images.length}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Dialog.Close
                className="rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/90 transition hover:bg-white/10"
                aria-label="Close panorama viewer"
              >
                Close
              </Dialog.Close>
            </div>
          </div>

          <div className="relative min-h-0 flex-1">
            <div className="absolute inset-0">
              {active && (
                <Canvas
                  dpr={[1, 2]}
                  camera={{ position: [0, 0, 0.1], fov: 75, near: 0.01, far: 2000 }}
                  gl={{ antialias: true, powerPreference: "high-performance" }}
                >
                  <React.Suspense fallback={null}>
                    <PanoramaSphere src={active.src} onLoadingChange={setIsLoading} onProgress={setLoadProgress} />
                    <OrbitControls
                      enablePan={false}
                      enableZoom
                      zoomSpeed={0.8}
                      rotateSpeed={-0.35}
                      enableDamping
                      dampingFactor={0.08}
                      touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_ROTATE }}
                    />
                  </React.Suspense>
                </Canvas>
              )}
            </div>

            {isLoading && (
              <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
                <div className="w-[min(66vw,22rem)] rounded-full bg-white/15 p-[2px] backdrop-blur-sm">
                  <div
                    className="h-[3px] rounded-full bg-white transition-[width] duration-150"
                    style={{ width: `${Math.max(6, Math.min(100, loadProgress))}%` }}
                  />
                </div>
              </div>
            )}

            {images.length > 1 && (
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-black/75 via-black/35 to-transparent" />
                <div className="pointer-events-none relative mx-auto flex max-w-[min(92vw,40rem)] items-center justify-between gap-3 px-3 pt-10">
                  <button
                    type="button"
                    onClick={goPrev}
                    className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/55 px-4 py-2 text-sm font-semibold text-white shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_10px_28px_rgba(0,0,0,0.55)] backdrop-blur-md transition hover:bg-black/65 active:scale-[0.99]"
                    aria-label="Previous panorama"
                  >
                    <ChevronLeft className="h-5 w-5" aria-hidden />
                    Prev
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/55 px-4 py-2 text-sm font-semibold text-white shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_10px_28px_rgba(0,0,0,0.55)] backdrop-blur-md transition hover:bg-black/65 active:scale-[0.99]"
                    aria-label="Next panorama"
                  >
                    Next
                    <ChevronRight className="h-5 w-5" aria-hidden />
                  </button>
                </div>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function PanoramaSphere({
  src,
  onLoadingChange,
  onProgress,
}: {
  src: string
  onLoadingChange?: (loading: boolean) => void
  onProgress?: (pct: number) => void
}) {
  const texture = useEquirectTexture(src, { onLoadingChange, onProgress })
  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[500, 64, 32]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  )
}

function useEquirectTexture(
  src: string,
  opts?: { onLoadingChange?: (loading: boolean) => void; onProgress?: (pct: number) => void },
) {
  const [tex, setTex] = React.useState<THREE.Texture | null>(null)
  type Opts = NonNullable<typeof opts>
  const onLoadingChangeRef = React.useRef<Opts["onLoadingChange"]>(undefined)
  const onProgressRef = React.useRef<Opts["onProgress"]>(undefined)

  React.useEffect(() => {
    onLoadingChangeRef.current = opts?.onLoadingChange
    onProgressRef.current = opts?.onProgress
  }, [opts?.onLoadingChange, opts?.onProgress])

  React.useEffect(() => {
    let cancelled = false
    onLoadingChangeRef.current?.(true)
    onProgressRef.current?.(3)
    const loader = new THREE.TextureLoader()

    loader.load(
      src,
      (t) => {
        if (cancelled) return
        t.colorSpace = THREE.SRGBColorSpace
        t.wrapS = THREE.ClampToEdgeWrapping
        t.wrapT = THREE.ClampToEdgeWrapping
        t.needsUpdate = true
        setTex(t)
        onProgressRef.current?.(100)
        onLoadingChangeRef.current?.(false)
      },
      (evt) => {
        if (cancelled) return
        const total = typeof evt.total === "number" && evt.total > 0 ? evt.total : null
        const loaded = typeof evt.loaded === "number" && evt.loaded > 0 ? evt.loaded : 0
        if (!total) {
          onProgressRef.current?.(Math.min(95, Math.max(6, loaded ? 25 : 12)))
          return
        }
        const pct = Math.round((loaded / total) * 100)
        onProgressRef.current?.(Math.min(99, Math.max(3, pct)))
      },
      () => {
        if (cancelled) return
        setTex(null)
        onLoadingChangeRef.current?.(false)
      },
    )

    return () => {
      cancelled = true
      onLoadingChangeRef.current?.(false)
      setTex((prev) => {
        prev?.dispose()
        return null
      })
    }
  }, [src])

  // Fallback 1x1 black texture to keep material valid while loading.
  return React.useMemo(() => {
    if (tex) return tex
    const data = new Uint8Array([0, 0, 0, 255])
    const t = new THREE.DataTexture(data, 1, 1)
    t.needsUpdate = true
    return t
  }, [tex])
}

