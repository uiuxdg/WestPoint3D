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

export function GET() {
  const url = resolveVideoUrl()
  if (!url) return new NextResponse(null, { status: 404 })
  return NextResponse.redirect(url, 307)
}

