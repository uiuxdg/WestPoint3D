import type { Metadata } from "next"
import PanoramaRedoubt4Client from "./PanoramaRedoubt4Client"

export const metadata: Metadata = {
  title: "Redoubt 4 Panoramas",
}

export default function Page() {
  return <PanoramaRedoubt4Client />
}

