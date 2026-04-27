import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

/** Prefer server-only env so SAS URLs are not embedded in the client JS bundle. */
const SERVER_ENV = "REDOUBT4_GRID7_VIDEO_URL"
const PUBLIC_ENV = "NEXT_PUBLIC_REDOUBT4_GRID7_VIDEO_URL"

// If no blob/SAS is configured yet, fall back to the SharePoint-hosted MP4.
// We normalize it to a direct-download URL so it can play inline via <video>.
const DEFAULT_SHAREPOINT_URL =
  "https://commonwealthcultural.sharepoint.com/:v:/s/all/IQAGqYQT_ozeSZMiNy_itNntAVyp0o-4D_zS9OF2T1syqII?e=fGK2ZJ"

function normalizeVideoUrl(url: string): string {
  try {
    const u = new URL(url)
    const host = u.hostname.toLowerCase()
    // SharePoint "share" links often resolve to an HTML player page. `download=1` coerces direct file download,
    // which browsers can usually play inline via <video>.
    if (host.endsWith("sharepoint.com") && !u.searchParams.has("download")) {
      u.searchParams.set("download", "1")
      return u.toString()
    }
  } catch {
    // fall through
  }
  return url
}

function resolveVideoUrl(): string | null {
  const fromServer = process.env[SERVER_ENV]?.trim()
  if (fromServer) return normalizeVideoUrl(fromServer)
  const fromPublic = process.env[PUBLIC_ENV]?.trim()
  if (fromPublic) return normalizeVideoUrl(fromPublic)
  return normalizeVideoUrl(DEFAULT_SHAREPOINT_URL)
}

/** Lets the client know whether inline playback is configured (no redirect body). */
export function HEAD() {
  if (!resolveVideoUrl()) return new NextResponse(null, { status: 404 })
  return new NextResponse(null, { status: 204 })
}

/** Redirects the browser / `<video>` to the blob (or SAS) URL. */
export function GET() {
  const url = resolveVideoUrl()
  if (!url) return new NextResponse(null, { status: 404 })
  return NextResponse.redirect(url, 307)
}
