"use client"

import * as React from "react"
import * as Dialog from "@radix-ui/react-dialog"

export interface ImageViewerImage {
  src: string
  alt: string
}

interface ImageViewerModalProps {
  open: boolean
  image: ImageViewerImage | null
  onClose: () => void
}

export function ImageViewerModal({ open, image, onClose }: ImageViewerModalProps) {
  const [zoom, setZoom] = React.useState(1)
  const [pan, setPan] = React.useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = React.useState(false)
  const panStartRef = React.useRef<{ x: number; y: number } | null>(null)
  const panOffsetRef = React.useRef({ x: 0, y: 0 })

  React.useEffect(() => {
    if (image) {
      setZoom(1)
      setPan({ x: 0, y: 0 })
    }
  }, [image])

  const handleViewerWheel = React.useCallback((e: WheelEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const delta = e.deltaY > 0 ? -0.15 : 0.15
    setZoom((z) => Math.min(5, Math.max(0.5, z + delta)))
  }, [])
  React.useEffect(() => {
    if (!open || !image) return
    document.addEventListener("wheel", handleViewerWheel, { passive: false, capture: true })
    return () => document.removeEventListener("wheel", handleViewerWheel, { capture: true })
  }, [open, image, handleViewerWheel])

  const handleViewerMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    panStartRef.current = { x: e.clientX, y: e.clientY }
    panOffsetRef.current = { ...pan }
    setIsDragging(true)
  }
  const handleViewerMouseMove = (e: React.MouseEvent) => {
    if (panStartRef.current === null) return
    setPan({
      x: panOffsetRef.current.x + e.clientX - panStartRef.current.x,
      y: panOffsetRef.current.y + e.clientY - panStartRef.current.y,
    })
  }
  const handleViewerMouseUp = () => {
    panStartRef.current = null
    setIsDragging(false)
  }
  const handleViewerMouseLeave = () => {
    panStartRef.current = null
    setIsDragging(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => (!o ? onClose() : null)}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out" />
        <Dialog.Content
          className="fixed z-[90] flex flex-col rounded-xl border border-white/10 bg-zinc-900/95 p-0 text-white shadow-[0_0.75vmin_2.8vmin_rgba(0,0,0,0.6)] backdrop-blur-md data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out"
          style={{ left: "5%", right: "5%", top: "5%", bottom: "5%" }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-zinc-900/95 px-4 py-3 md:px-6 md:py-4">
            <Dialog.Title className="text-xl font-bold uppercase leading-none tracking-tight [font-family:var(--font-libre-baskerville),ui-serif,Georgia,serif] md:text-2xl">
              {image?.alt ?? "Image"}
            </Dialog.Title>
            <Dialog.Close
              className="rounded-md px-3 py-1.5 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              Close
            </Dialog.Close>
          </div>
          <div
            className="relative min-h-0 flex-1 overflow-hidden"
            onMouseDown={handleViewerMouseDown}
            onMouseMove={handleViewerMouseMove}
            onMouseUp={handleViewerMouseUp}
            onMouseLeave={handleViewerMouseLeave}
            style={{ cursor: isDragging ? "grabbing" : "grab" }}
          >
            {image && (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.src}
                  alt={image.alt}
                  className="h-full w-auto max-w-none select-none object-contain"
                  draggable={false}
                  style={{ pointerEvents: "none" }}
                />
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
