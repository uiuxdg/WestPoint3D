"use client"

import * as React from "react"
import * as Dialog from "@radix-ui/react-dialog"
import Image from "next/image"

type DrawerKind = "images" | "files" | "research" | null

export function DrawerPanel({ variant }: { variant?: "site1" | "site2" | "site3" }) {
  const [openKind, setOpenKind] = React.useState<DrawerKind>(null)

  const open = (kind: DrawerKind) => setOpenKind(kind)
  const close = () => setOpenKind(null)

  return (
    <div className="mt-6 w-full">
      <div className="relative mx-auto w-full">
        <Image
          src="/images/drawer.png"
          alt="File drawers"
          width={800}
          height={1200}
          className="h-auto w-full select-none rounded-xl drop-shadow-[0_12px_32px_rgba(0,0,0,0.6)]"
          unoptimized
          priority={false}
        />
        {/* Alpha-aware inner shadow overlay, masked by the drawer image alpha */}
        <div
          className="pointer-events-none absolute inset-0 z-10 rounded-xl shadow-[inset_0_0_40px_rgba(0,0,0,0.55)]"
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
              aria-label="Open Images"
            >
              <span className="-translate-y-[20%] text-lg tracking-wide text-[#8B4513] font-bold drop-shadow">
                Images
              </span>
              <span className="pointer-events-none absolute inset-0 rounded-lg transition-shadow duration-200 group-hover:shadow-[0_0_0_2px_rgba(255,255,0,0.9),0_0_18px_4px_rgba(255,255,0,0.55)]" />
            </button>

            {/* Button 2: Files */}
            <button
              type="button"
              onClick={() => open("files")}
              className="pointer-events-auto group relative m-2 mb-4 flex flex-1 items-center justify-center bg-transparent"
              aria-label="Open Files"
            >
              <span className="-translate-y-[20%] text-lg tracking-wide text-[#8B4513] font-bold drop-shadow">
                Files
              </span>
              <span className="pointer-events-none absolute inset-0 rounded-lg transition-shadow duration-200 group-hover:shadow-[0_0_0_2px_rgba(255,255,0,0.9),0_0_18px_4px_rgba(255,255,0,0.55)]" />
            </button>

            {/* Button 3: Research */}
            <button
              type="button"
              onClick={() => open("research")}
              className="pointer-events-auto group relative m-2 mb-0 flex flex-1 items-center justify-center bg-transparent"
              aria-label="Open Research"
            >
              <span className="-translate-y-[28%] text-lg tracking-wide text-[#8B4513] font-bold drop-shadow">
                Research
              </span>
              <span className="pointer-events-none absolute inset-0 rounded-lg transition-shadow duration-200 group-hover:shadow-[0_0_0_2px_rgba(255,255,0,0.9),0_0_18px_4px_rgba(255,255,0,0.55)]" />
            </button>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <Dialog.Root open={openKind !== null} onOpenChange={(o) => (!o ? close() : null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-[70] w-[90vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-zinc-900/90 p-6 text-white shadow-[0_10px_40px_rgba(0,0,0,0.6)] backdrop-blur-md data-[state=open]:animate-in data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:zoom-out-95">
            <div className="mb-4 flex items-center justify-between">
              <Dialog.Title className="text-2xl font-bold uppercase tracking-wide">
                {openKind === "images" && "Images"}
                {openKind === "files" && "Files"}
                {openKind === "research" && "Research"}
              </Dialog.Title>
              <Dialog.Close
                className="rounded-md px-3 py-1 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                Close
              </Dialog.Close>
            </div>
            <div className="space-y-3 text-white/90">
              {openKind === "images" &&
                (variant === "site1" ? (
                  <div className="space-y-2">
                    <Image
                      src="/images/redoubt4.png"
                      alt="Redoubt 4"
                      width={1200}
                      height={900}
                      className="h-auto w-full rounded-lg"
                      priority={false}
                    />
                    <p className="text-sm text-white/70">Redoubt 4 — Site 1 image</p>
                  </div>
                ) : (
                  <p>Placeholder for images content. Add your gallery or thumbnails here.</p>
                ))}
              {openKind === "files" &&
                (variant === "site1" ? (
                  <>
                    <p>
                      Redoubt 4 general vicinity 3D terrain model:{" "}
                      <a
                        href="https://dhc.westpoint.edu/3dmodelpage/redoubt-4/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-300 underline hover:text-blue-200"
                      >
                        View model
                      </a>
                    </p>
                  </>
                ) : (
                  <p>Placeholder for files content. Add your file list or downloads here.</p>
                ))}
              {openKind === "research" &&
                (variant === "site1" ? (
                  <>
                    <p>
                      Learn more on{" "}
                      <a
                        href="https://en.wikipedia.org/wiki/Redoubt_Four_(West_Point)"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-300 underline hover:text-blue-200"
                      >
                        Redoubt Four (West Point)
                      </a>
                      .
                    </p>
                    <p>
                      Redoubt 4 Reconstruction Project Report — Crozier (1976–1977):{" "}
                      <a
                        href="https://commonwealthcultural.sharepoint.com/:b:/s/all/IQA49_Cru3zDQ5U9tLdVmwFXAVK_Ff_42Ijs7pSqStQTgJo?e=xZNAyZ"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-300 underline hover:text-blue-200"
                      >
                        View report
                      </a>
                    </p>
                    <p>
                      The West Point Landscape — Jon C. Malinowski, PhD. (2024):{" "}
                      <a
                        href="https://commonwealthcultural.sharepoint.com/:b:/s/all/IQAehrcTxlhCRLAHyQ64kN_1AeVnZGS0L0iQ1mreoUPWts0?e=IwhIYd"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-300 underline hover:text-blue-200"
                      >
                        View PDF
                      </a>
                    </p>
                  </>
                ) : (
                  <p>Placeholder for research content. Add your articles or notes here.</p>
                ))}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}


