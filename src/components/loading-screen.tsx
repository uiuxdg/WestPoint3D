"use client"

import { useEffect, useState } from "react"

export function LoadingScreen({ isVisible = true }: { isVisible?: boolean }) {
  const [message, setMessage] = useState(1)

  useEffect(() => {
    const timer = setTimeout(() => {
      setMessage(2)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={`fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950 overflow-hidden transition-opacity duration-700 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      aria-hidden={!isVisible}
    >
      {/* Mesh gradient blobs */}
      <div className="absolute inset-0">
        <div
          className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full opacity-30 blur-[120px]"
          style={{ background: "radial-gradient(circle, #1e293b 0%, transparent 70%)" }}
        />
        <div
          className="absolute top-1/4 right-0 w-[600px] h-[600px] rounded-full opacity-25 blur-[100px]"
          style={{ background: "radial-gradient(circle, #1e3a5f 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-0 left-1/3 w-[700px] h-[700px] rounded-full opacity-20 blur-[110px]"
          style={{ background: "radial-gradient(circle, #0f172a 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full opacity-30 blur-[90px]"
          style={{ background: "radial-gradient(circle, #172554 0%, transparent 70%)" }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-[600px] h-[600px] rounded-full opacity-25 blur-[100px] -translate-x-1/2 -translate-y-1/2"
          style={{ background: "radial-gradient(circle, #1e40af 0%, transparent 70%)" }}
        />
      </div>

      {/* Grainy/scratchy texture overlay */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          mixBlendMode: "overlay",
        }}
      />

      <div className="text-center relative z-10">
        <h2
          className={`text-4xl text-white transition-opacity duration-1000 ${
            message === 1 ? "opacity-100" : "opacity-0"
          }`}
        >
          Welcome to West Point
        </h2>
        <h2
          className={`text-4xl text-white transition-opacity duration-1000 ${
            message === 2 ? "opacity-100" : "opacity-0"
          }`}
        >
          Preparing your virtual tour...
        </h2>
      </div>
    </div>
  )
}
