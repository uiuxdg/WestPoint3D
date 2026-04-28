import type { PanoramaImage } from "@/components/panorama-viewer-modal"

const REDOUBT4_PANORAMIC_FILENAMES = [
  "Redoubt 4 Day 1- Setup 008.jpg",
  "Redoubt 4 Day 1- Setup 009.jpg",
  "Redoubt 4 Day 1- Setup 012.jpg",
  "Redoubt 4 Day 1- Setup 016.jpg",
  "Redoubt 4 Day 1- Setup 043.jpg",
  "Redoubt 4 Day 1- Setup 044.jpg",
  "Redoubt 4 Day 1- Setup 054.jpg",
  "Redoubt 4 Day 1- Setup 056.jpg",
  "Redoubt 4 Day 1- Setup 060.jpg",
] as const

export const REDOUBT4_PANORAMAS_FALLBACK: PanoramaImage[] = REDOUBT4_PANORAMIC_FILENAMES.map((name) => ({
  src: encodeURI(`/images/Redoubt 4/Panoramic/${name}`),
  alt: `Redoubt 4 panorama — ${name.replace(/\.[^.]+$/, "")}`,
}))

export async function fetchRedoubt4Panoramas(): Promise<PanoramaImage[]> {
  try {
    const res = await fetch("/api/panoramas/redoubt-4", { cache: "no-store" })
    if (!res.ok) return REDOUBT4_PANORAMAS_FALLBACK
    const data = (await res.json()) as unknown
    if (!Array.isArray(data)) return REDOUBT4_PANORAMAS_FALLBACK

    // Basic runtime shape check to avoid TypeScript/runtime issues if API changes.
    const parsed: PanoramaImage[] = data
      .filter((x) => x && typeof x === "object")
      .map((x) => x as { src?: unknown; alt?: unknown })
      .filter((x) => typeof x.src === "string" && typeof x.alt === "string")
      .map((x) => ({ src: x.src as string, alt: x.alt as string }))

    return parsed.length ? parsed : REDOUBT4_PANORAMAS_FALLBACK
  } catch {
    return REDOUBT4_PANORAMAS_FALLBACK
  }
}

// Backwards-compatible export name for existing imports.
export const REDOUBT4_PANORAMAS = REDOUBT4_PANORAMAS_FALLBACK
