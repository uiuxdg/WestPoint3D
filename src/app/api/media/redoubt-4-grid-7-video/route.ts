import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

/** Prefer server-only env so SAS URLs are not embedded in the client JS bundle. */
const SERVER_ENV = "REDOUBT4_GRID7_VIDEO_URL"
const PUBLIC_ENV = "NEXT_PUBLIC_REDOUBT4_GRID7_VIDEO_URL"

function resolveVideoUrl(): string | null {
  const fromServer = process.env[SERVER_ENV]?.trim()
  if (fromServer) return fromServer
  const fromPublic = process.env[PUBLIC_ENV]?.trim()
  if (fromPublic) return fromPublic
  return null
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
