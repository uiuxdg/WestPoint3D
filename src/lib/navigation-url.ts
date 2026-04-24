import type { ViewMode } from "@/types/view-mode"

/** URL `s` slug for each lobby section (order matches `lobbySectionLabels` in page). */
export const LOBBY_SECTION_SLUGS = [
  "home",
  "aerial-map-of-west-point",
  "captain-greenleafs-plan",
  "redoubt-4",
  "fort-clinton",
  "fort-putnam",
  "redoubt-2",
  "batteries",
  "fort-webb",
  "additional-sites",
  "cultural-heritage",
] as const

const REDOUBT_4_SECTION_SLUGS = [
  "main-earthwork-rampart",
  "western-bastion",
  "artillery-positions",
  "strategic-overview",
] as const

const REDOUBT_5_SECTION_SLUGS = [
  "front-glacis",
  "breach-point",
  "inner-parade-ground",
  "complete-fortification",
] as const

const COMING_SOON_SECTION_SLUGS = [
  "v-shaped-salient",
  "left-flank",
  "right-flank",
  "tactical-analysis",
] as const

function sectionSlugsForView(view: ViewMode): readonly string[] {
  switch (view) {
    case "lobby":
      return LOBBY_SECTION_SLUGS
    case "redoubt-4":
      return REDOUBT_4_SECTION_SLUGS
    case "redoubt-5":
      return REDOUBT_5_SECTION_SLUGS
    case "coming-soon":
      return COMING_SOON_SECTION_SLUGS
  }
}

export function parseNavigationFromSearch(sp: Pick<URLSearchParams, "get">): {
  viewMode: ViewMode
  section: number
} {
  const viewParam = sp.get("view")
  const viewMode: ViewMode =
    viewParam === "redoubt-4" || viewParam === "redoubt-5" || viewParam === "coming-soon"
      ? viewParam
      : "lobby"
  const slugs = sectionSlugsForView(viewMode) as readonly string[]
  const raw = sp.get("s")?.trim().toLowerCase() ?? ""
  let idx = slugs.indexOf(raw)
  if (idx < 0) idx = 0
  return { viewMode, section: idx }
}

/** Query string for `?view=…&s=…` (omits `view` when lobby). */
export function buildNavigationQuery(viewMode: ViewMode, section: number): string {
  const slugs = sectionSlugsForView(viewMode) as readonly string[]
  const bounded = Math.max(0, Math.min(section, slugs.length - 1))
  const params = new URLSearchParams()
  if (viewMode !== "lobby") params.set("view", viewMode)
  params.set("s", slugs[bounded] ?? slugs[0])
  return params.toString()
}
