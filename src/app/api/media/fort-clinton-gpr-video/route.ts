import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const SERVER_ENV = "FORT_CLINTON_GPR_VIDEO_URL"
const PUBLIC_ENV = "NEXT_PUBLIC_FORT_CLINTON_GPR_VIDEO_URL"

function normalizeVideoUrl(url: string): string {
  try {
    const u = new URL(url)
    const host = u.hostname.toLowerCase()
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
  return null
}

export function HEAD() {
  if (!resolveVideoUrl()) return new NextResponse(null, { status: 404 })
  return new NextResponse(null, { status: 204 })
}

function pickForwardHeaders(upstream: Headers): Headers {
  const out = new Headers()
  const allowList = [
    "accept-ranges",
    "cache-control",
    "content-length",
    "content-range",
    "content-type",
    "etag",
    "last-modified",
  ]

  for (const key of allowList) {
    const v = upstream.get(key)
    if (v) out.set(key, v)
  }
  // Ensure we don't cache local dev responses.
  if (!out.has("cache-control")) out.set("cache-control", "no-store")
  return out
}

export async function GET(req: Request) {
  const url = resolveVideoUrl()
  if (!url) return new NextResponse(null, { status: 404 })

  // Proxy the video through our origin so Azure Blob CORS does not block playback.
  // Also supports byte-range requests for scrub/seek.
  const range = req.headers.get("range") ?? undefined
  const upstream = await fetch(url, {
    method: "GET",
    headers: range ? { range } : undefined,
    redirect: "follow",
    cache: "no-store",
  })

  // Pass through upstream failures as-is so the browser shows a meaningful error.
  if (!upstream.body) {
    return new NextResponse(null, { status: upstream.status || 502 })
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: pickForwardHeaders(upstream.headers),
  })
}
