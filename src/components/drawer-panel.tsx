"use client"

import * as React from "react"
import * as Dialog from "@radix-ui/react-dialog"
import Image from "next/image"
import { PanoramaViewerModal, type PanoramaImage } from "@/components/panorama-viewer-modal"
import { fetchRedoubt4Panoramas, REDOUBT4_PANORAMAS_FALLBACK } from "@/lib/panoramas"

type DrawerKind = "images" | "files" | "research" | null

/** Drawer modal galleries: smaller optimized requests; full asset opens in the image viewer. */
const MODAL_THUMB_QUALITY = 40
const MODAL_THUMB_W = 480
const MODAL_THUMB_H = 320

const modalThumbButtonClass =
  "group block w-full cursor-zoom-in overflow-hidden rounded-lg border border-white/10 bg-zinc-950/40 shadow-sm transition-[box-shadow,border-color,transform] duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/80 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 hover:border-amber-200/60 hover:shadow-[0_0_0_1px_rgba(252,211,77,0.4),0_0_24px_rgba(251,191,36,0.38),0_0_52px_rgba(251,191,36,0.14)] active:scale-[0.99]"

const modalThumbImgClassCover =
  "h-auto w-full object-cover transition-[filter] duration-200 group-hover:brightness-[1.07]"
const modalThumbImgClassContain =
  "h-auto w-full object-contain transition-[filter] duration-200 group-hover:brightness-[1.05]"

const REDOUBT4_LIDAR_THUMB_SRC = "/images/Redoubt%204/LiDAR%20Thumb.png"

const FORT_PUTNAM_IMAGES = Array.from({ length: 30 }, (_, i) => {
  const num = String(57 + i).padStart(4, "0")
  return { src: `/images/Fort Putnam/IMG_${num}.jpeg`, alt: `Fort Putnam ${num}` }
})

const _redoubt4PanoramasTypecheck: PanoramaImage[] = REDOUBT4_PANORAMAS_FALLBACK

/** Sorted filenames under public/images/Fort Clinton (IMG_0071 excluded from the gallery). */
const FORT_CLINTON_IMAGES = [
  "IMG_0046.jpeg",
  "IMG_0055.jpeg",
  "IMG_0075.jpeg",
  "IMG_0090.jpeg",
  "IMG_0091.jpeg",
  "IMG_0092.jpeg",
  "IMG_0093.jpeg",
  "IMG_0094.jpeg",
  "IMG_0095.jpeg",
  "IMG_0096.jpeg",
  "IMG_0623.JPG",
  "IMG_0624.JPG",
  "IMG_0625.JPG",
  "IMG_0626.JPG",
  "IMG_0627.JPG",
  "IMG_0628.JPG",
  "IMG_0629.JPG",
  "IMG_0630.JPG",
  "IMG_0631.JPG",
  "IMG_0632.JPG",
  "IMG_0633.JPG",
  "IMG_0634.JPG",
  "IMG_0635.JPG",
  "IMG_0636.JPG",
  "IMG_0637.JPG",
  "IMG_0638.JPG",
  "IMG_0639.JPG",
  "IMG_0640.JPG",
  "IMG_0641.JPG",
  "IMG_0642.JPG",
  "IMG_0643.JPG",
  "IMG_0644.JPG",
  "IMG_0645.JPG",
  "IMG_0646.JPG",
  "IMG_0647.JPG",
  "IMG_0648.JPG",
  "IMG_0649.JPG",
  "IMG_0650.JPG",
  "IMG_0651.JPG",
  "IMG_0652.JPG",
  "IMG_0653.JPG",
  "IMG_0654.JPG",
  "IMG_0656.JPG",
  "IMG_0657.JPG",
  "IMG_0658.JPG",
  "IMG_0659.JPG",
  "IMG_0660.JPG",
  "IMG_0661.JPG",
  "IMG_0662.JPG",
  "IMG_0663.JPG",
  "IMG_0664.JPG",
  "IMG_0665.JPG",
  "IMG_0667.JPG",
  "IMG_0669.JPG",
  "IMG_0672.JPG",
  "IMG_0673.JPG",
  "IMG_0674.JPG",
  "IMG_0675.JPG",
  "IMG_0676.JPG",
  "IMG_0677.JPG",
  "IMG_0678.JPG",
  "IMG_0679.JPG",
  "IMG_0680.JPG",
  "IMG_0681.JPG",
  "IMG_0682.JPG",
  "IMG_0683.JPG",
  "IMG_0684.JPG",
  "IMG_0685.JPG",
  "IMG_0686.JPG",
  "IMG_0687.JPG",
  "IMG_0688.JPG",
  "IMG_0689.JPG",
  "IMG_0690.JPG",
  "IMG_0691.JPG",
  "IMG_0692.JPG",
  "IMG_0693.JPG",
  "IMG_0694.JPG",
  "IMG_0695.JPG",
  "IMG_0696.JPG",
  "IMG_0697.JPG",
  "IMG_0698.JPG",
  "IMG_0699.JPG",
  "IMG_0700.JPG",
  "IMG_0701.JPG",
  "IMG_0702.JPG",
  "IMG_0703.JPG",
  "IMG_0704.JPG",
  "IMG_0711.JPG",
  "IMG_0719.JPG",
  "IMG_0725.JPG",
  "IMG_0726.JPG",
  "IMG_0727.JPG",
  "IMG_0728.JPG",
  "IMG_0729.JPG",
  "IMG_0730.JPG",
  "IMG_0731.JPG",
  "IMG_0735.JPG",
  "IMG_0736.JPG",
  "IMG_0737.JPG",
  "IMG_0739.JPG",
  "IMG_0740.JPG",
  "IMG_0741.JPG",
  "IMG_0742.JPG",
  "IMG_0743.JPG",
  "IMG_0744.JPG",
  "IMG_0745.JPG",
  "IMG_0746.JPG",
  "IMG_0747.JPG",
  "IMG_0748.JPG",
  "IMG_0750.JPG",
  "IMG_0751.JPG",
  "IMG_0752.JPG",
  "IMG_0759.JPG",
  "IMG_0765.JPG",
  "IMG_0773.JPG",
  "IMG_0774.JPG",
  "IMG_0775.JPG",
  "IMG_0776.JPG",
  "PXL_20241021_192637242.jpg",
  "PXL_20241021_192658608.jpg",
  "PXL_20241021_194044467.jpg",
  "PXL_20241021_194051403.jpg",
  "PXL_20241021_203801473.jpg",
  "PXL_20241021_203928417.jpg",
  "PXL_20241021_212210844.jpg",
  "PXL_20241028_224757875.jpg",
  "PXL_20241028_224808254.jpg",
  "PXL_20241028_224823429.jpg",
].map((name) => ({
  src: `/images/Fort Clinton/${name}`,
  alt: `Fort Clinton ${name.replace(/\.[^.]+$/, "").replace(/_/g, " ")}`,
}))

const FORT_CLINTON_RESEARCH_IMAGES = [
  "Fort Clinton Phase 2 Study Area.jpg",
  "Fort Clinton Through the Years.jpg",
].map((name) => ({
  src: `/images/Fort Clinton/Research/${encodeURIComponent(name)}`,
  alt: `Fort Clinton ${name.replace(/\.[^.]+$/, "")}`,
}))

/** When unset, fall back to SharePoint (opens in new tab; no iframe). */
const REDOUBT4_GRID7_SHAREPOINT_URL =
  "https://commonwealthcultural.sharepoint.com/:v:/s/all/IQAGqYQT_ozeSZMiNy_itNntAVyp0o-4D_zS9OF2T1syqII?e=fGK2ZJ"

const REDOUBT4_GRID7_VIDEO_API = "/api/media/redoubt-4-grid-7-video"
const FORT_CLINTON_GPR_VIDEO_API = "/api/media/fort-clinton-gpr-video"

/** Redoubt 4 GPR data — SharePoint folder (Ground Penetrating Radar drawer). */
const REDOUBT4_GPR_DATA_SHAREPOINT_URL =
  "https://commonwealthcultural.sharepoint.com/:f:/s/all/IgA9_RJAMJFxRJ3J4vTYaB3NAZj1_f5vCEJA_BEWBvUW_BM?e=0PXvuY"

const FORT_CLINTON_RESEARCH_SHAREPOINT_DOC_URL =
  "https://commonwealthcultural.sharepoint.com/:w:/s/all/IQDvfPHXKAH4S7e_FE5yXR_oARF32XQoVk-JCTx2eZOYwp8?e=w7pCLj"

const blobVideoBoxClass =
  "flex aspect-video w-full max-h-[min(60dvh,520px)] animate-pulse items-center justify-center rounded-lg border border-white/10 bg-zinc-950/60"

const blobVideoPlayerClass = "max-h-[min(60dvh,520px)] w-full rounded-lg bg-black object-contain"

function BlobInlineVideo({ apiPath, fallback }: { apiPath: string; fallback: React.ReactNode }) {
  const [inlineReady, setInlineReady] = React.useState<boolean | null>(null)

  React.useEffect(() => {
    let cancelled = false
    fetch(apiPath, { method: "HEAD" })
      .then((res) => {
        if (!cancelled) setInlineReady(res.status === 204)
      })
      .catch(() => {
        if (!cancelled) setInlineReady(false)
      })
    return () => {
      cancelled = true
    }
  }, [apiPath])

  if (inlineReady === null) {
    return (
      <div className={blobVideoBoxClass} aria-busy aria-label="Checking video configuration" />
    )
  }

  if (inlineReady) {
    return (
      <video className={blobVideoPlayerClass} controls playsInline preload="metadata" src={apiPath}>
        Your browser does not support embedded video.
      </video>
    )
  }

  return <>{fallback}</>
}

function EmptyDrawerPlaceholder({
  variant,
  kind,
}: {
  variant?: "site1" | "site2" | "site3"
  kind: Exclude<DrawerKind, null>
}) {
  const siteName =
    variant === "site1" ? "Redoubt 4" : variant === "site2" ? "Fort Clinton" : variant === "site3" ? "Fort Putnam" : "this site"

  const kindLabel = kind === "images" ? "Images" : kind === "files" ? "Files" : "Research"

  const whatToExpect =
    kind === "images"
      ? "photographs, scans, LiDAR/photogrammetry, and short videos"
      : kind === "files"
        ? "reports, maps, downloads, and supporting documentation"
        : "notes, citations, interpretive material, and supporting references"

  return (
    <div className="rounded-xl border border-white/15 bg-zinc-950/50 p-4 shadow-sm md:p-6">
      <p className="text-base font-semibold text-white md:text-xl">
        {kindLabel} for {siteName} are still in progress
      </p>
      <p className="mt-2 text-sm leading-snug text-white/70 md:text-base">
        Research and development of the virtual archive for {siteName} has not yet been completed. This drawer will be
        populated as materials are processed and prepared for public viewing.
      </p>
      <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-3 md:p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-white/60 md:text-sm">What to expect here</p>
        <p className="mt-1 text-sm text-white/80 md:text-base">{whatToExpect}</p>
      </div>
    </div>
  )
}

function Redoubt4Grid7Video() {
  return (
    <BlobInlineVideo
      apiPath={REDOUBT4_GRID7_VIDEO_API}
      fallback={
        <div className="flex aspect-video w-full max-h-[min(60dvh,520px)] flex-col items-center justify-center gap-2 rounded-lg border border-white/15 bg-zinc-950/90 px-4 py-10 text-center text-white">
          <span className="text-sm font-semibold">Redoubt 4 Grid 7 — video</span>
          <span className="max-w-[95%] text-xs text-white/60">
            Inline video playback isn’t configured yet. Set REDOUBT4_GRID7_VIDEO_URL (preferred) or
            NEXT_PUBLIC_REDOUBT4_GRID7_VIDEO_URL to a direct video URL (Azure blob/SAS), restart the dev server, then
            reload.
          </span>
        </div>
      }
    />
  )
}

function FortClintonGprVideo() {
  return (
    <BlobInlineVideo
      apiPath={FORT_CLINTON_GPR_VIDEO_API}
      fallback={
        <div className="flex aspect-video w-full max-h-[min(60dvh,520px)] flex-col items-center justify-center gap-2 rounded-lg border border-white/15 bg-zinc-950/90 px-4 py-10 text-center text-white">
          <span className="text-sm font-semibold">Fort Clinton GPR video</span>
          <span className="max-w-[95%] text-xs text-white/60">
            Run scripts/upload-fort-clinton-gpr.ps1, then set FORT_CLINTON_GPR_VIDEO_URL or NEXT_PUBLIC_FORT_CLINTON_GPR_VIDEO_URL
            to the blob or SAS URL. Restart the dev server and reload. Blob CORS must allow this origin (GET, HEAD).
          </span>
        </div>
      }
    />
  )
}

/** Crozier (1974) and Mead (1968) — listed under Redoubt 4 → Historical reports and Fort Putnam → Research. */
const CROZIER_MEAD_HISTORICAL_REPORT_PDFS: { href: string; description: string; linkLabel?: string }[] = [
  {
    href: "https://commonwealthcultural.sharepoint.com/:b:/s/all/IQDOiBlxHX0JQaTMtcFgnmhuAY-Zn1TI-_umPholafjf-Q4?e=98ej1d",
    description:
      "Crozier (1974) — archaeological survey of Fort Putnam and related West Point earthworks (PDF).",
  },
  {
    href: "https://commonwealthcultural.sharepoint.com/:b:/s/all/IQCbKf5O67dsQZDI-BaM7r_uATi21SSh09mFqGyxbO55dtM?e=pX7dOd",
    description: "Mead (1968) — survey of Fort Putnam and other Revolutionary War–era fortifications (PDF).",
  },
]

/** Redoubt 4 → Historical reports modal (PDFs + optional KMZ). `linkLabel` defaults to “View PDF”. */
const REDOUBT4_HISTORICAL_REPORT_PDFS: { href: string; description: string; linkLabel?: string }[] = [
  ...CROZIER_MEAD_HISTORICAL_REPORT_PDFS,
  {
    href: "https://commonwealthcultural.sharepoint.com/:b:/s/all/IQBuOQ1CobMrQoyg-3PuDuI2ATzDkL2R8wS6Pan4knglGyU?e=n7OWpd",
    description: "Redoubt 4 Reconstruction Project report — Crozier, 1976–1977 (PDF).",
  },
  {
    href: "https://commonwealthcultural.sharepoint.com/:b:/s/all/IQDjzOlAJtblSoLMe0MAagUPAT-meETPtPIqiLWyAe0epOg?e=RL1kIF",
    description: "The West Point Landscape — Jon C. Malinowski, Ph.D. (2024) (PDF).",
  },
  {
    href: "https://commonwealthcultural.sharepoint.com/:b:/s/all/IQCUvu31JxL9SoHRwEda5s4vAQctL4HGwGXj0jLaTQwG8_E?e=JIfEF3",
    description: "West Point 'life of cadet' (1917) — period account of cadet life (PDF).",
  },
  {
    href: "https://commonwealthcultural.sharepoint.com/:b:/s/all/IQBjWK07HLIKQLqpCBi9GSLiAaIvDnky0R6vuhDAPDfr_e4?e=AZI48T",
    description:
      "2017-08-08 Kimball to Raley — project correspondence memo (PDF).",
  },
  {
    href: "https://commonwealthcultural.sharepoint.com/:b:/s/all/IQB3F8a7Wm_pT709ag7uOzxLAf42fmJW2b29AXMNB-wZyzA?e=NcZVq7",
    description: "geophys_redoubt4_Aug2017 — Redoubt 4 geophysical survey materials from August 2017 (PDF).",
  },
  {
    href: "https://commonwealthcultural.sharepoint.com/:u:/s/all/IQDzFZF1sYhJRIk9nH4yrv7PAbTNuVQWL0JHyfb_qWOCoSs?e=nhpIbZ",
    description:
      "Redoubt 4.kmz — Google Earth layer / placemarks for the site (download or open in Google Earth).",
    linkLabel: "Open KMZ",
  },
  {
    href: "https://commonwealthcultural.sharepoint.com/:b:/s/all/IQBNvKppRNvMRoFZ0irlMgjUAXiy0EY3ZOY_Cgwv97tHGUM?e=7kEfvY",
    description: "Cubbison (2004) — The Redoubts of West Point: overview of the defensive line and individual works (PDF).",
  },
  {
    href: "https://commonwealthcultural.sharepoint.com/:b:/s/all/IQCjPRvhs-CETLEM5S1OjIkOAWbmGkCXOYjZfMMXhCCSYKw?e=mdNunz",
    description: "Fortress West Point — visitor brochure on the fortifications and landscape (PDF).",
  },
  {
    href: "https://commonwealthcultural.sharepoint.com/:b:/s/all/IQDDEMUWUhSMTJW-gJZ9UmkkAddcmUGtxYRIZJGL9pFd85Y?e=NB4E6Q",
    description: "Gruber, August 1974 — PDF from the Commonwealth Cultural library.",
  },
  {
    href: "https://commonwealthcultural.sharepoint.com/:b:/s/all/IQCfUiTPjjgKRo2a6kUfFSB6AQtY959Y-aLizXCrcwdt3v4?e=Q4vl5X",
    description: "Appendix A — GPR data table (supporting documentation, PDF).",
  },
  {
    href: "https://commonwealthcultural.sharepoint.com/:b:/s/all/IQCIXJYF2dvMS62soUB9SJ1jAUNt6tLk602AOaVqzAmbd7s?e=5cWbRh",
    description: "Appendix B — LiDAR capture and web application notes (PDF).",
  },
  {
    href: "https://commonwealthcultural.sharepoint.com/:b:/s/all/IQA9oHl0Hx-UT7fNVcI2hwcAAS6F2TgRhzXbw24GPAoVRdM?e=rSSSQI",
    description: "Appendix C — pension letter concerning Nathan Clark (primary source, PDF).",
  },
  {
    href: "https://commonwealthcultural.sharepoint.com/:b:/s/all/IQDg7xXafSr0R7O8KXhO4gQ3AUBA7IUlomuOpzpgRWq2EeI?e=I8dHaB",
    description:
      "West Point GPR, Redoubt 4 — project record 24-PC-03917 / MA2501 (geophysical report, PDF).",
  },
]

export function DrawerPanel({
  variant,
  onOpenImageViewer,
  compact,
}: {
  variant?: "site1" | "site2" | "site3"
  onOpenImageViewer?: (src: string, alt: string) => void
  /** When true, labels use smaller font so they scale with the drawer in tight layouts (e.g. mobile in-card). */
  compact?: boolean
}) {
  const isRedoubt4 = variant === "site1"
  const isFortClinton = variant === "site2"
  const labelClass = compact
    ? "text-[clamp(0.6rem,1.85vmin,0.82rem)] md:text-xs"
    : "text-[clamp(0.95rem,1.95vmin,1.15rem)] md:text-lg"
  /** Redoubt 4: longer labels need slightly smaller type to fit drawer slots. */
  const redoubt4LabelClass = compact
    ? "text-[clamp(0.55rem,1.45vmin,0.7rem)] md:text-[10px]"
    : "text-[clamp(0.6rem,1.55vmin,0.75rem)] sm:text-[0.75rem] md:text-xs"
  const drawerLabelClass = isRedoubt4 || isFortClinton ? redoubt4LabelClass : labelClass

  const [redoubt4Panoramas, setRedoubt4Panoramas] = React.useState<PanoramaImage[]>(REDOUBT4_PANORAMAS_FALLBACK)
  React.useEffect(() => {
    let cancelled = false
    fetchRedoubt4Panoramas().then((imgs) => {
      if (!cancelled) setRedoubt4Panoramas(imgs)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const [openKind, setOpenKind] = React.useState<DrawerKind>(null)
  const [panoramaOpen, setPanoramaOpen] = React.useState(false)

  const open = (kind: DrawerKind) => setOpenKind(kind)
  const close = () => setOpenKind(null)
  const openViewer = (src: string, alt: string) => {
    onOpenImageViewer?.(src, alt)
  }

  const drawerButtonLabels = isRedoubt4
    ? { images: "LiDAR, Images, & Videos", files: "Historical reports", research: "Ground Penetrating Radar" }
    : isFortClinton
      ? { images: "Images and video", files: "Files", research: "Research" }
      : { images: "Images", files: "Files", research: "Research" }

  const dialogTitle = (kind: DrawerKind) => {
    if (!kind) return ""
    if (isRedoubt4) {
      if (kind === "images") return "LiDAR, Images, & Videos"
      if (kind === "files") return "Historical reports"
      return "Ground Penetrating Radar"
    }
    if (kind === "images" && isFortClinton) return "Images and video"
    if (kind === "images") return "Images"
    if (kind === "files") return "Files"
    return "Research"
  }

  /** Tan pill behind drawer slot labels (saddle-brown text stays readable). */
  const drawerLabelSurface =
    "tracking-tight sm:tracking-wide inline-flex min-w-0 max-w-[92%] items-center justify-center overflow-hidden text-ellipsis text-center leading-tight rounded-md bg-[#E0C9A8]/92 px-2 py-0.5 shadow-sm md:px-2.5 md:py-1"
  const drawerLabelNoWrapClass = ""

  return (
    <div className="mt-4 md:mt-6 w-full">
      <div className="relative mx-auto w-full">
        <Image
          src="/images/drawer.png"
          alt="File drawers"
          width={800}
          height={1200}
          className="h-auto w-full select-none rounded-xl drop-shadow-[0_0.85vmin_2.2vmin_rgba(0,0,0,0.6)]"
          unoptimized
          priority={false}
        />
        {/* Alpha-aware inner shadow overlay, masked by the drawer image alpha */}
        <div
          className="pointer-events-none absolute inset-0 z-10 rounded-xl shadow-[inset_0_0_2.8vmin_rgba(0,0,0,0.55)]"
          style={{
            maskImage: "url(/images/drawer.png)",
            maskSize: "contain",
            maskRepeat: "no-repeat",
            maskPosition: "center",
            WebkitMaskImage: "url(/images/drawer.png)",
            WebkitMaskSize: "contain",
            WebkitMaskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
          }}
        />

        {/* Overlay buttons */}
        <div className="pointer-events-none absolute left-0 right-0 pl-7 pr-6 top-[13%] bottom-[10%] z-10">
          <div className="flex h-full w-full flex-col">
            {/* Button 1: Images */}
            <button
              type="button"
              onClick={() => open("images")}
              className={
                isRedoubt4
                  ? "pointer-events-auto group relative mx-1.5 mb-1.5 mt-0 flex flex-[1.06_1_0%] items-center justify-center bg-transparent"
                  : "pointer-events-auto group relative m-2 mb-4 flex flex-[1.1_1_0%] items-center justify-center bg-transparent"
              }
              aria-label={`Open ${drawerButtonLabels.images}`}
            >
              <span
                className={`-translate-y-[20%] ${drawerLabelSurface} ${drawerLabelNoWrapClass} ${drawerLabelClass} text-[#8B4513] font-bold drop-shadow`}
              >
                {drawerButtonLabels.images}
              </span>
              <span className="pointer-events-none absolute inset-0 rounded-lg transition-shadow duration-200 group-hover:shadow-[0_0_0_max(0.1vw,0.14vmin)_rgba(255,255,0,0.9),0_0_max(1.1vw,1.3vmin)_max(0.2vw,0.28vmin)_rgba(255,255,0,0.55)]" />
            </button>

            {/* Button 2: Files */}
            <button
              type="button"
              onClick={() => open("files")}
              className={
                isRedoubt4
                  ? "pointer-events-auto group relative mx-1.5 mb-1.5 mt-0 flex flex-1 items-center justify-center bg-transparent"
                  : "pointer-events-auto group relative m-2 mb-4 flex flex-1 items-center justify-center bg-transparent"
              }
              aria-label={`Open ${drawerButtonLabels.files}`}
            >
              <span
                className={`-translate-y-[20%] ${drawerLabelSurface} ${drawerLabelNoWrapClass} ${drawerLabelClass} text-[#8B4513] font-bold drop-shadow`}
              >
                {drawerButtonLabels.files}
              </span>
              <span className="pointer-events-none absolute inset-0 rounded-lg transition-shadow duration-200 group-hover:shadow-[0_0_0_max(0.1vw,0.14vmin)_rgba(255,255,0,0.9),0_0_max(1.1vw,1.3vmin)_max(0.2vw,0.28vmin)_rgba(255,255,0,0.55)]" />
            </button>

            {/* Button 3: Research */}
            <button
              type="button"
              onClick={() => open("research")}
              className={
                isRedoubt4
                  ? "pointer-events-auto group relative mx-1.5 mb-0 mt-0 flex flex-1 items-center justify-center bg-transparent"
                  : "pointer-events-auto group relative m-2 mb-0 flex flex-1 items-center justify-center bg-transparent"
              }
              aria-label={`Open ${drawerButtonLabels.research}`}
            >
              <span
                className={`-translate-y-[28%] ${drawerLabelSurface} ${drawerLabelNoWrapClass} ${drawerLabelClass} text-[#8B4513] font-bold drop-shadow`}
              >
                {drawerButtonLabels.research}
              </span>
              <span className="pointer-events-none absolute inset-0 rounded-lg transition-shadow duration-200 group-hover:shadow-[0_0_0_max(0.1vw,0.14vmin)_rgba(255,255,0,0.9),0_0_max(1.1vw,1.3vmin)_max(0.2vw,0.28vmin)_rgba(255,255,0,0.55)]" />
            </button>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <Dialog.Root open={openKind !== null} onOpenChange={(o) => (!o ? close() : null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out" />
          <Dialog.Content className="fixed inset-[2vh_2vw] z-70 flex min-h-0 min-w-0 flex-col rounded-xl border border-white/10 bg-zinc-900/90 p-0 text-white shadow-[0_0.75vmin_2.8vmin_rgba(0,0,0,0.6)] backdrop-blur-md data-[state=open]:animate-in data-[state=open]:zoom-in-95 data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=closed]:fade-out md:inset-auto md:left-1/2 md:top-1/2 md:h-[84dvh] md:max-h-[90dvh] md:w-[90dvw] md:min-h-[84dvh] md:min-w-[min(48vw,55vmin)] md:max-w-[min(92dvw,88vmin)] md:-translate-x-1/2 md:-translate-y-1/2">
            <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-white/10 bg-zinc-900/95 px-2 py-2 backdrop-blur-md md:px-3 md:py-2.5">
              <Dialog.Title className="text-xl font-bold uppercase leading-none tracking-tight [font-family:var(--font-libre-baskerville),ui-serif,Georgia,serif] md:text-2xl">
                {dialogTitle(openKind)}
              </Dialog.Title>
              <Dialog.Close
                className="rounded-md px-3 py-1 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                Close
              </Dialog.Close>
            </div>
            <div className="relative min-h-0 flex-1">
              <div className="absolute left-0 right-0 top-0 z-10 h-8 pointer-events-none bg-linear-to-b from-zinc-900/95 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 z-10 h-8 pointer-events-none bg-linear-to-t from-zinc-900/95 to-transparent" />
              <div className="h-full overflow-y-auto px-2 pb-2 pt-1.5 md:px-3 md:pb-3 md:pt-2">
                <div className={`mx-auto space-y-3 text-white/90 text-base md:text-lg ${openKind === "images" && (variant === "site2" || variant === "site3") ? "max-w-full" : "max-w-full md:max-w-[min(96%,48rem)]"}`}>
              {openKind === "images" &&
                (variant === "site1" ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-white/70">Interactive LiDAR tour</p>
                      <button
                        type="button"
                        onClick={() =>
                          window.open("https://redoubtfour.commonwealthcultural.com", "_blank", "noopener,noreferrer")
                        }
                        className="group relative block w-full overflow-hidden rounded-xl border border-white/10 bg-zinc-950/40 shadow-sm transition-[box-shadow,border-color,transform] duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/80 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 hover:border-amber-200/60 hover:shadow-[0_0_0_1px_rgba(252,211,77,0.4),0_0_28px_rgba(251,191,36,0.42),0_0_56px_rgba(251,191,36,0.16)] active:scale-[0.99]"
                        aria-label="Take interactive LiDAR Tour"
                      >
                        <Image
                          src={REDOUBT4_LIDAR_THUMB_SRC}
                          alt="LiDAR Tour thumbnail"
                          width={1200}
                          height={675}
                          sizes="(max-width: 768px) 96vw, min(48rem, 90vw)"
                          quality={24}
                          className="h-auto w-full object-cover transition-[filter,transform] duration-300 group-hover:brightness-[1.05] group-hover:contrast-[1.02] group-hover:saturate-[1.05] group-hover:scale-[1.01]"
                          priority={false}
                        />
                        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/75 via-black/20 to-transparent opacity-95 transition-opacity duration-300 group-hover:opacity-85" />
                        <div className="pointer-events-none absolute inset-0 flex items-end justify-center p-3 md:p-4">
                          <div className="rounded-full border border-white/15 bg-black/45 px-4 py-2 text-sm font-semibold tracking-wide text-white shadow-[0_0_0_1px_rgba(0,0,0,0.2)] backdrop-blur-sm transition-[background-color,border-color,box-shadow] duration-300 group-hover:border-amber-200/50 group-hover:bg-black/35 group-hover:shadow-[0_0_0_1px_rgba(252,211,77,0.35),0_0_22px_rgba(251,191,36,0.25)] md:text-base">
                            Take interactive LiDAR Tour
                          </div>
                        </div>
                      </button>
                    </div>
                    <div className="space-y-2">
                      <p className="text-white/70">Redoubt 4 Grid 7 — video</p>
                      <Redoubt4Grid7Video />
                    </div>
                    <div className="space-y-2 border-t border-white/10 pt-4">
                      <p className="text-white/70">Redoubt 4 panoramic images</p>
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPanoramaOpen(true)}
                          className="inline-flex items-center justify-center rounded-md border border-white/30 bg-white/10 px-3 py-1.5 text-base text-white transition hover:bg-white/20 md:text-xl"
                        >
                          View panoramas
                        </button>
                      </div>
                      <p className="text-xs text-white/55 md:text-sm">
                        Tip: drag to look around. Use the fullscreen button in the viewer for an immersive experience.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => openViewer("/images/redoubt4.png", "Redoubt 4")}
                        className={modalThumbButtonClass}
                      >
                        <Image
                          src="/images/redoubt4.png"
                          alt="Redoubt 4"
                          width={800}
                          height={600}
                          sizes="(max-width: 768px) 96vw, min(48rem, 90vw)"
                          quality={MODAL_THUMB_QUALITY}
                          className={modalThumbImgClassContain}
                          priority={false}
                        />
                      </button>
                      <p className="text-white/70">Redoubt 4 — Site 1 image</p>
                    </div>
                    <div className="space-y-2 border-t border-white/10 pt-4">
                      <p className="text-white/70">Commonwealth Cultural — West Point image</p>
                      <div className="flex justify-center">
                        <a
                          href="https://commonwealthcultural.sharepoint.com/:i:/s/all/IQBmuxlqDF63SbufwO5e_gQMARiDQu4E1S0PzWzdwpig0jw?e=Eqp64C"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block rounded-md border border-white/30 bg-white/10 px-3 py-1.5 text-base text-white transition hover:bg-white/20 md:text-xl"
                        >
                          Commonwealth Cultural — West Point image
                        </a>
                      </div>
                    </div>
                  </div>
                ) : variant === "site2" ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-white/70">Fort Clinton — GPR overview (video)</p>
                      <FortClintonGprVideo />
                    </div>
                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                      {FORT_CLINTON_IMAGES.map(({ src, alt }) => (
                        <button
                          key={src}
                          type="button"
                          onClick={() => openViewer(src, alt)}
                          className={modalThumbButtonClass}
                        >
                          <Image
                            src={src}
                            alt={alt}
                            width={MODAL_THUMB_W}
                            height={MODAL_THUMB_H}
                            sizes="(max-width: 768px) 46vw, min(320px, 24vw)"
                            quality={MODAL_THUMB_QUALITY}
                            className={modalThumbImgClassCover}
                            priority={false}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : variant === "site3" ? (
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    {FORT_PUTNAM_IMAGES.map(({ src, alt }) => (
                      <button
                        key={src}
                        type="button"
                        onClick={() => openViewer(src, alt)}
                        className={modalThumbButtonClass}
                      >
                        <Image
                          src={src}
                          alt={alt}
                          width={MODAL_THUMB_W}
                          height={MODAL_THUMB_H}
                          sizes="(max-width: 768px) 46vw, min(320px, 24vw)"
                          quality={MODAL_THUMB_QUALITY}
                          className={modalThumbImgClassCover}
                          priority={false}
                        />
                      </button>
                    ))}
                  </div>
                ) : (
                  <EmptyDrawerPlaceholder variant={variant} kind="images" />
                ))}
              {openKind === "files" &&
                (variant === "site1" ? (
                  <div className="space-y-4">
                    <p>Redoubt 4 general vicinity 3D terrain model (2017):</p>
                    <div className="flex justify-center">
                      <a
                        href="https://dhc.westpoint.edu/3dmodelpage/redoubt-4/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block rounded-md border border-white/30 bg-white/10 px-3 py-1.5 text-xl text-white transition hover:bg-white/20"
                      >
                        View model
                      </a>
                    </div>
                    <div className="flex justify-center">
                      <a
                        href="https://commonwealthcultural.sharepoint.com/:b:/s/all/IQC4CxSMWcPoRJlYNQSsTQ4vAb02FlDJyy-qixFwe3WvKWs?e=gSm4Cx"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block rounded-md border border-white/30 bg-white/10 px-3 py-1.5 text-xl text-white transition hover:bg-white/20"
                      >
                        Redoubt 4 2017 GPR and Magnetometry Data
                      </a>
                    </div>
                    <p>West Point: The Gibraltar of the Hudson (American Battlefield Trust):</p>
                    <div className="flex justify-center">
                      <a
                        href="https://www.battlefields.org/learn/articles/west-point"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block rounded-md border border-white/30 bg-white/10 px-3 py-1.5 text-xl text-white transition hover:bg-white/20"
                      >
                        Read article
                      </a>
                    </div>
                    <div className="space-y-4 border-t border-white/10 pt-4">
                      <p className="text-white/90">Additional historical reports and data (PDF / KMZ):</p>
                      {REDOUBT4_HISTORICAL_REPORT_PDFS.map(({ href, description, linkLabel }) => (
                        <div key={href} className="space-y-2">
                          <p className="text-sm leading-snug text-white/80 md:text-base">{description}</p>
                          <div className="flex justify-center">
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block rounded-md border border-white/30 bg-white/10 px-3 py-1.5 text-base text-white transition hover:bg-white/20 md:text-xl"
                            >
                              {linkLabel ?? "View PDF"}
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <EmptyDrawerPlaceholder variant={variant} kind="files" />
                ))}
              {openKind === "research" &&
                (variant === "site1" ? (
                  <div className="space-y-4">
                    <p className="text-white/90">Redoubt 4 GPR data and related materials (SharePoint folder):</p>
                    <div className="flex justify-center">
                      <a
                        href={REDOUBT4_GPR_DATA_SHAREPOINT_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block rounded-md border border-white/30 bg-white/10 px-3 py-1.5 text-base text-white transition hover:bg-white/20 md:text-xl"
                      >
                        Open GPR data on SharePoint
                      </a>
                    </div>
                  </div>
                ) : variant === "site2" ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-white/90">Fort Clinton research document (SharePoint):</p>
                      <div className="flex justify-center">
                        <a
                          href={FORT_CLINTON_RESEARCH_SHAREPOINT_DOC_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block rounded-md border border-white/30 bg-white/10 px-3 py-1.5 text-base text-white transition hover:bg-white/20 md:text-xl"
                        >
                          Open research document
                        </a>
                      </div>
                    </div>

                    <div className="space-y-2 border-t border-white/10 pt-4">
                      <p className="text-white/70">Fort Clinton research images</p>
                      <div className="grid grid-cols-2 gap-3 md:gap-4">
                        {FORT_CLINTON_RESEARCH_IMAGES.map(({ src, alt }) => (
                          <button
                            key={src}
                            type="button"
                            onClick={() => openViewer(src, alt)}
                            className={modalThumbButtonClass}
                          >
                            <Image
                              src={src}
                              alt={alt}
                              width={MODAL_THUMB_W}
                              height={MODAL_THUMB_H}
                              sizes="(max-width: 768px) 46vw, min(320px, 24vw)"
                              quality={MODAL_THUMB_QUALITY}
                              className={modalThumbImgClassContain}
                              priority={false}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : variant === "site3" ? (
                  <div className="space-y-4">
                    <p className="text-white/90">Historical reports (PDF):</p>
                    {CROZIER_MEAD_HISTORICAL_REPORT_PDFS.map(({ href, description, linkLabel }) => (
                      <div key={href} className="space-y-2">
                        <p className="text-sm leading-snug text-white/80 md:text-base">{description}</p>
                        <div className="flex justify-center">
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block rounded-md border border-white/30 bg-white/10 px-3 py-1.5 text-base text-white transition hover:bg-white/20 md:text-xl"
                          >
                            {linkLabel ?? "View PDF"}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyDrawerPlaceholder variant={variant} kind="research" />
                ))}
                </div>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <PanoramaViewerModal
        open={panoramaOpen && openKind === "images" && variant === "site1"}
        images={redoubt4Panoramas}
        initialIndex={0}
        onClose={() => setPanoramaOpen(false)}
      />
    </div>
  )
}


