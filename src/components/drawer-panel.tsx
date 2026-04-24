"use client"

import * as React from "react"
import * as Dialog from "@radix-ui/react-dialog"
import Image from "next/image"

type DrawerKind = "images" | "files" | "research" | null

const FORT_PUTNAM_IMAGES = Array.from({ length: 30 }, (_, i) => {
  const num = String(57 + i).padStart(4, "0")
  return { src: `/images/Fort Putnam/IMG_${num}.jpeg`, alt: `Fort Putnam ${num}` }
})

const FORT_CLINTON_IMAGES = [
  "IMG_0071.jpeg",
  "IMG_0075.jpeg",
  "IMG_0637.JPG",
  "IMG_0741.JPG",
  "IMG_0742.JPG",
  "IMG_0743.JPG",
  "IMG_0748.JPG",
  "PXL_20241021_192637242.jpg",
  "PXL_20241021_192658608.jpg",
  "PXL_20241021_194044467.jpg",
  "PXL_20241021_194051403.jpg",
  "PXL_20241021_203801473.jpg",
  "PXL_20241021_203928417.jpg",
  "PXL_20241021_212210844.jpg",
].map((name) => ({
  src: `/images/Fort Clinton/${name}`,
  alt: `Fort Clinton ${name.replace(/\.[^.]+$/, "").replace(/_/g, " ")}`,
}))

/** Redoubt 4 → Historical reports modal (PDFs + optional KMZ). `linkLabel` defaults to “View PDF”. */
const REDOUBT4_HISTORICAL_REPORT_PDFS: { href: string; description: string; linkLabel?: string }[] = [
  {
    href: "https://commonwealthcultural.sharepoint.com/:b:/s/all/IQDOiBlxHX0JQaTMtcFgnmhuAY-Zn1TI-_umPholafjf-Q4?e=98ej1d",
    description:
      "Crozier (1974) — archaeological survey of Fort Putnam and related West Point earthworks (PDF).",
  },
  {
    href: "https://commonwealthcultural.sharepoint.com/:b:/s/all/IQCbKf5O67dsQZDI-BaM7r_uATi21SSh09mFqGyxbO55dtM?e=pX7dOd",
    description: "Mead (1968) — survey of Fort Putnam and other Revolutionary War–era fortifications (PDF).",
  },
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
    href: "https://commonwealthcultural.sharepoint.com/:b:/s/all/IQAX0oq5qUzeR64KVG-ia7JSAdGOvkgRL4_S7Pje2aCDflw?e=0q0Jd0",
    description:
      "West Point Integrated Cultural Resources Management Plan — draft environmental assessment (ICRMP draft EA) (PDF).",
  },
  {
    href: "https://commonwealthcultural.sharepoint.com/:b:/s/all/IQDDEMUWUhSMTJW-gJZ9UmkkAddcmUGtxYRIZJGL9pFd85Y?e=NB4E6Q",
    description: "Gruber, August 1974 — PDF from the Commonwealth Cultural library.",
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
  const labelClass = compact
    ? "text-[max(2.55vw,2.05vmin)] md:text-xs"
    : "text-base md:text-lg"
  /** Redoubt 4: longer labels need smaller type to fit the drawer slots (incl. scaled mobile/desktop layouts). */
  const redoubt4LabelClass = compact
    ? "text-[max(1.75vw,1.42vmin)] md:text-[10px] leading-tight text-center px-0.5"
    : "text-[clamp(0.5rem,1.65vmin,0.6875rem)] sm:text-[0.6875rem] md:text-xs leading-tight text-center px-0.5"
  const drawerLabelClass = isRedoubt4 ? redoubt4LabelClass : labelClass
  const [openKind, setOpenKind] = React.useState<DrawerKind>(null)

  const open = (kind: DrawerKind) => setOpenKind(kind)
  const close = () => setOpenKind(null)
  const openViewer = (src: string, alt: string) => {
    onOpenImageViewer?.(src, alt)
  }

  const drawerButtonLabels = isRedoubt4
    ? { images: "Images", files: "Historical reports", research: "Ground Penetrating Radar" }
    : { images: "Images", files: "Files", research: "Research" }

  const dialogTitle = (kind: DrawerKind) => {
    if (!kind) return ""
    if (isRedoubt4) {
      if (kind === "images") return "Images"
      if (kind === "files") return "Historical reports"
      return "Ground Penetrating Radar"
    }
    if (kind === "images") return "Images"
    if (kind === "files") return "Files"
    return "Research"
  }

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
              className="pointer-events-auto group relative m-2 mb-4 flex flex-[1.1_1_0%] items-center justify-center bg-transparent"
              aria-label={`Open ${drawerButtonLabels.images}`}
            >
              <span
                className={`-translate-y-[20%] ${drawerLabelClass} ${isRedoubt4 ? "tracking-tight sm:tracking-wide" : "tracking-wide"} text-[#8B4513] font-bold drop-shadow`}
              >
                {drawerButtonLabels.images}
              </span>
              <span className="pointer-events-none absolute inset-0 rounded-lg transition-shadow duration-200 group-hover:shadow-[0_0_0_max(0.1vw,0.14vmin)_rgba(255,255,0,0.9),0_0_max(1.1vw,1.3vmin)_max(0.2vw,0.28vmin)_rgba(255,255,0,0.55)]" />
            </button>

            {/* Button 2: Files */}
            <button
              type="button"
              onClick={() => open("files")}
              className="pointer-events-auto group relative m-2 mb-4 flex flex-1 items-center justify-center bg-transparent"
              aria-label={`Open ${drawerButtonLabels.files}`}
            >
              <span
                className={`-translate-y-[20%] ${drawerLabelClass} ${isRedoubt4 ? "tracking-tight sm:tracking-wide" : "tracking-wide"} text-[#8B4513] font-bold drop-shadow`}
              >
                {drawerButtonLabels.files}
              </span>
              <span className="pointer-events-none absolute inset-0 rounded-lg transition-shadow duration-200 group-hover:shadow-[0_0_0_max(0.1vw,0.14vmin)_rgba(255,255,0,0.9),0_0_max(1.1vw,1.3vmin)_max(0.2vw,0.28vmin)_rgba(255,255,0,0.55)]" />
            </button>

            {/* Button 3: Research */}
            <button
              type="button"
              onClick={() => open("research")}
              className="pointer-events-auto group relative m-2 mb-0 flex flex-1 items-center justify-center bg-transparent"
              aria-label={`Open ${drawerButtonLabels.research}`}
            >
              <span
                className={`-translate-y-[28%] ${drawerLabelClass} ${isRedoubt4 ? "tracking-tight sm:tracking-wide" : "tracking-wide"} text-[#8B4513] font-bold drop-shadow`}
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
          <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-[70] flex h-[84dvh] max-h-[90dvh] w-[92dvw] min-w-0 max-w-[min(92dvw,42vmin)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-xl border border-white/10 bg-zinc-900/90 p-0 text-white shadow-[0_0.75vmin_2.8vmin_rgba(0,0,0,0.6)] backdrop-blur-md data-[state=open]:animate-in data-[state=open]:zoom-in-95 data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=closed]:fade-out md:min-h-[84dvh] md:max-h-[90dvh] md:w-[90dvw] md:min-w-[min(48vw,55vmin)] md:max-w-[min(92dvw,88vmin)]">
            <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-white/10 bg-zinc-900/95 px-2 py-2 backdrop-blur-md md:px-3 md:py-2.5">
              <Dialog.Title className="text-xl font-bold uppercase tracking-wide md:text-2xl">
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
              <div className="absolute left-0 right-0 top-0 z-10 h-8 pointer-events-none bg-gradient-to-b from-zinc-900/95 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 z-10 h-8 pointer-events-none bg-gradient-to-t from-zinc-900/95 to-transparent" />
              <div className="h-full overflow-y-auto px-2 pb-2 pt-1.5 md:px-3 md:pb-3 md:pt-2">
                <div className={`mx-auto space-y-3 text-white/90 text-base md:text-lg ${openKind === "images" && (variant === "site2" || variant === "site3") ? "max-w-full" : "max-w-full md:max-w-[min(96%,48rem)]"}`}>
              {openKind === "images" &&
                (variant === "site1" ? (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => openViewer("/images/redoubt4.png", "Redoubt 4")}
                      className="block w-full cursor-zoom-in rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
                    >
                      <Image
                        src="/images/redoubt4.png"
                        alt="Redoubt 4"
                        width={1200}
                        height={900}
                        className="h-auto w-full rounded-lg object-contain"
                        priority={false}
                      />
                    </button>
                    <p className="text-white/70">Redoubt 4 — Site 1 image</p>
                  </div>
                ) : variant === "site2" ? (
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    {FORT_CLINTON_IMAGES.map(({ src, alt }) => (
                      <button
                        key={src}
                        type="button"
                        onClick={() => openViewer(src, alt)}
                        className="cursor-zoom-in rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
                      >
                        <Image
                          src={src}
                          alt={alt}
                          width={600}
                          height={400}
                          className="h-auto w-full rounded-lg object-cover"
                          priority={false}
                          unoptimized
                        />
                      </button>
                    ))}
                  </div>
                ) : variant === "site3" ? (
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    {FORT_PUTNAM_IMAGES.map(({ src, alt }) => (
                      <button
                        key={src}
                        type="button"
                        onClick={() => openViewer(src, alt)}
                        className="cursor-zoom-in rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
                      >
                        <Image
                          src={src}
                          alt={alt}
                          width={600}
                          height={400}
                          className="h-auto w-full rounded-lg object-cover"
                          priority={false}
                          unoptimized
                        />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p>Placeholder for images content. Add your gallery or thumbnails here.</p>
                ))}
              {openKind === "files" &&
                (variant === "site1" ? (
                  <div className="space-y-4">
                    <p>Redoubt 4 general vicinity 3D terrain model:</p>
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
                        Redoubt 4 2017 Magnetometry Data
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
                  <p>Placeholder for files content. Add your file list or downloads here.</p>
                ))}
              {openKind === "research" &&
                (variant === "site1" ? (
                  <div className="space-y-4">
                    <p>Learn more on Redoubt Four (West Point).</p>
                    <div className="flex justify-center">
                      <a
                        href="https://en.wikipedia.org/wiki/Redoubt_Four_(West_Point)"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block rounded-md border border-white/30 bg-white/10 px-3 py-1.5 text-xl text-white transition hover:bg-white/20"
                      >
                        Redoubt Four (West Point)
                      </a>
                    </div>
                    <p>Redoubt 4 Reconstruction Project Report — Crozier (1976–1977):</p>
                    <div className="flex justify-center">
                      <a
                        href="https://commonwealthcultural.sharepoint.com/:b:/s/all/IQA49_Cru3zDQ5U9tLdVmwFXAVK_Ff_42Ijs7pSqStQTgJo?e=xZNAyZ"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block rounded-md border border-white/30 bg-white/10 px-3 py-1.5 text-xl text-white transition hover:bg-white/20"
                      >
                        View report
                      </a>
                    </div>
                    <p>The West Point Landscape — Jon C. Malinowski, PhD. (2024):</p>
                    <div className="flex justify-center">
                      <a
                        href="https://commonwealthcultural.sharepoint.com/:b:/s/all/IQAehrcTxlhCRLAHyQ64kN_1AeVnZGS0L0iQ1mreoUPWts0?e=IwhIYd"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block rounded-md border border-white/30 bg-white/10 px-3 py-1.5 text-xl text-white transition hover:bg-white/20"
                      >
                        View PDF
                      </a>
                    </div>
                    <div className="flex justify-center">
                      <a
                        href="https://commonwealthcultural.sharepoint.com/:i:/s/all/IQBmuxlqDF63SbufwO5e_gQMARiDQu4E1S0PzWzdwpig0jw?e=Eqp64C"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block rounded-md border border-white/30 bg-white/10 px-3 py-1.5 text-xl text-white transition hover:bg-white/20"
                      >
                        Commonwealth Cultural — West Point image
                      </a>
                    </div>
                    <div className="flex justify-center">
                      <a
                        href="https://www.shopthepoint.com/product/wall-art-west-point-1778-1780-historical-map-18-5-x17-/5447"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block rounded-md border border-white/30 bg-white/10 px-3 py-1.5 text-xl text-white transition hover:bg-white/20"
                      >
                        West Point 1778–1780 Historical Map (Shop the Point)
                      </a>
                    </div>
                    <div className="flex justify-center">
                      <a
                        href="https://www.battlefields.org/learn/articles/west-point"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block rounded-md border border-white/30 bg-white/10 px-3 py-1.5 text-xl text-white transition hover:bg-white/20"
                      >
                        West Point: The Gibraltar of the Hudson (American Battlefield Trust)
                      </a>
                    </div>
                  </div>
                ) : (
                  <p>Placeholder for research content. Add your articles or notes here.</p>
                ))}
                </div>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}


