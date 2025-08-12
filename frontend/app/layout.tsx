import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PhotoBooth — Capture & Customize Your Memories",
  description:
    "Create stunning photo strips with props, frames, and filters. Perfect for events, parties, or just having fun!",
  keywords: "photobooth, photo strips, props, filters, camera, photos",
  openGraph: {
    title: "PhotoBooth — Capture & Customize Your Memories",
    description:
      "Create stunning photo strips with props, frames, and filters. Perfect for events, parties, or just having fun!",
    type: "website",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
