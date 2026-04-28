"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { PanoramaViewerModal } from "@/components/panorama-viewer-modal"
import { fetchRedoubt4Panoramas, REDOUBT4_PANORAMAS_FALLBACK } from "@/lib/panoramas"

function parseInitialIndex(sp: URLSearchParams): number {
  const raw = sp.get("i")
  if (!raw) return 0
  const n = Number(raw)
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.floor(n))
}

function findSetupIndex(images: { alt: string; src: string }[], setup: string) {
  const needle = `setup ${setup}`.toLowerCase()
  const idx = images.findIndex((img) => {
    const alt = img.alt.toLowerCase()
    const src = img.src.toLowerCase()
    return alt.includes(needle) || src.includes(needle)
  })
  return idx >= 0 ? idx : 0
}

export default function PanoramaRedoubt4Client() {
  const router = useRouter()
  const [initialIndex, setInitialIndex] = React.useState(0)
  const [hasUrlOverride, setHasUrlOverride] = React.useState(false)
  const [images, setImages] = React.useState(REDOUBT4_PANORAMAS_FALLBACK)

  React.useEffect(() => {
    const sp = new URLSearchParams(window.location.search)
    const urlHasI = sp.has("i")
    setHasUrlOverride(urlHasI)
    if (urlHasI) setInitialIndex(parseInitialIndex(sp))
  }, [])

  React.useEffect(() => {
    let cancelled = false
    fetchRedoubt4Panoramas().then((imgs) => {
      if (cancelled) return
      setImages(imgs)
      // Default to Setup 008 on first load unless the URL explicitly overrides.
      if (!hasUrlOverride) setInitialIndex(findSetupIndex(imgs, "008"))
    })
    return () => {
      cancelled = true
    }
  }, [hasUrlOverride])

  return (
    <PanoramaViewerModal
      open
      images={images}
      initialIndex={initialIndex}
      onClose={() => {
        router.push("/?s=redoubt-4", { scroll: false })
      }}
    />
  )
}

