import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono, Manrope } from "next/font/google"

import "./globals.css"
import { siteMetadata } from "@/config/metadata"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { AcademicPlanProvider } from "@/components/providers/academic-plan-provider"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
})

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = siteMetadata

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    {
      media: "(prefers-color-scheme: light)",
      color: "#f8fafc",
    },
    {
      media: "(prefers-color-scheme: dark)",
      color: "#0b1120",
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={[
          geistSans.variable,
          geistMono.variable,
          manrope.variable,
          "min-h-screen bg-background font-sans text-foreground antialiased",
        ].join(" ")}>
        <ThemeProvider>
          <AcademicPlanProvider>{children}</AcademicPlanProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
