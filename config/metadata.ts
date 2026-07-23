import type { Metadata } from "next"

import { siteConfig } from "./site"

/**
 * Shared application metadata used by the root layout.
 *
 * Route-level metadata can override individual fields such as `title` and
 * `description` while inheriting the remaining site-wide configuration.
 */
export const siteMetadata: Metadata = {
  /**
   * Base URL used by Next.js to resolve relative metadata URLs.
   *
   * This affects canonical links, Open Graph images, icons, and other
   * metadata values that use relative paths.
   */
  metadataBase: new URL(siteConfig.url),

  /**
   * Name presented to browsers, operating systems, and installed-app surfaces.
   */
  applicationName: siteConfig.name,

  /**
   * Default document title and the template applied by nested routes.
   *
   * A route with `title: "Dashboard"` will render as:
   * `Dashboard | Guidance Counselor`.
   */
  title: {
    default: `${siteConfig.name} | Academic Planning Made Clear`,
    template: `%s | ${siteConfig.name}`,
  },

  /**
   * Default site description used when a route does not provide its own.
   */
  description: siteConfig.description,

  /**
   * Search terms that describe the application's primary use cases.
   *
   * These provide contextual metadata but are not a substitute for strong,
   * relevant page content.
   */
  keywords: [
    "academic planner",
    "college planner",
    "degree planner",
    "transcript analyzer",
    "college schedule planner",
    "graduation planner",
    "course planning",
    "degree requirements",
    "student planning",
  ],

  /**
   * Identifies the application as the author, creator, and publisher of the
   * site's content.
   */
  authors: [
    {
      name: siteConfig.name,
      url: siteConfig.url,
    },
  ],

  creator: siteConfig.name,
  publisher: siteConfig.name,

  /**
   * High-level content category used by supporting platforms.
   */
  category: "education",

  /**
   * Declares the preferred URL for the root page.
   *
   * Route-specific pages can provide their own canonical paths when needed.
   */
  alternates: {
    canonical: "/",
  },

  /**
   * Browser, device, and installed-app icons.
   *
   * Multiple sizes and formats improve compatibility across desktop browsers,
   * mobile devices, and progressive web app surfaces.
   */
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "any",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
      {
        url: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },

  /**
   * Web app manifest used for installable-app behavior and device theming.
   */
  manifest: "/manifest.webmanifest",

  /**
   * Metadata used when the site is shared on platforms that support the
   * Open Graph protocol.
   */
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} | Academic Planning Made Clear`,
    description: siteConfig.description,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} academic planning dashboard`,
      },
    ],
  },

  /**
   * Metadata used when pages are shared on X and other platforms that support
   * Twitter card markup.
   */
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | Academic Planning Made Clear`,
    description: siteConfig.description,
    images: ["/og-image.png"],
  },

  /**
   * Default indexing instructions for search engines.
   *
   * These settings allow public pages to be indexed and permit large image
   * previews and unrestricted text snippets.
   */
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  /**
   * Prevents browsers from automatically converting detected content into
   * clickable email, address, or telephone links.
   */
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
}
