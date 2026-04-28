import { NextResponse } from "next/server"
import path from "node:path"
import { readdir } from "node:fs/promises"

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"])

export async function GET() {
  const dir = path.join(process.cwd(), "public", "images", "Redoubt 4", "Panoramic")

  try {
    const names = await readdir(dir)
    const images = names
      .filter((name) => IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase()))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }))
      .map((name) => ({
        src: encodeURI(`/images/Redoubt 4/Panoramic/${name}`),
        alt: `Redoubt 4 panorama — ${name.replace(/\.[^.]+$/, "")}`,
      }))

    return NextResponse.json(images)
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to list panoramas", details: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
}

