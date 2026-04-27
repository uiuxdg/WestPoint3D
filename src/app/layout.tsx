import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono, Libre_Baskerville } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

const libreBaskerville = Libre_Baskerville({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-libre-baskerville",
  display: "swap",
})

function siteMetadataBase(): URL {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL)
  }
  if (process.env.VERCEL_URL) {
    return new URL(`https://${process.env.VERCEL_URL}`)
  }
  return new URL("http://localhost:3000")
}

const siteName = "West Point Virtual Archive"
const defaultTitle = "West Point Virtual Archive — Revolutionary War Fortifications"
const description =
  "Interactive 3D exploration of Revolutionary War fortifications at West Point, New York: reconstructions, panoramas, and archival context for the Hudson River defenses."

export const metadata: Metadata = {
  metadataBase: siteMetadataBase(),
  title: {
    default: defaultTitle,
    template: `%s | ${siteName}`,
  },
  description,
  applicationName: siteName,
  keywords: [
    "West Point",
    "Revolutionary War",
    "American Revolution",
    "fortifications",
    "Hudson River",
    "Continental Army",
    "military history",
    "3D visualization",
    "virtual archive",
    "New York history",
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  category: "history",
  classification: "Educational / historical heritage",

  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName,
    title: defaultTitle,
    description,
    images: [
      {
        url: "/web-app-manifest-512x512.png",
        width: 512,
        height: 512,
        alt: "West Point Virtual Archive — app icon",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description,
    images: ["/web-app-manifest-512x512.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  appleWebApp: {
    capable: true,
    title: siteName,
    statusBarStyle: "default",
  },

  formatDetection: {
    telephone: false,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={libreBaskerville.variable}>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
