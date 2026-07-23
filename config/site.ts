/**
 * Shared site-level configuration.
 *
 * This object centralizes branding, public URLs, support contact information,
 * and social links so metadata and UI components do not duplicate these
 * values throughout the application.
 */
export const siteConfig = {
  /**
   * Full product name used in page titles, metadata, and primary branding.
   */
  name: "Guidance Counselor",
  /**
   * Shortened product name for compact UI surfaces such as navigation,
   * mobile headers, and installed-app labels.
   */
  shortName: "Guidance",
  /**
   * Default product description used in site metadata and marketing copy.
   */
  description:
    "Turn completed coursework into a clear, generalized academic plan.",
  /**
   * Public application URL.
   *
   * Production deployments should define `NEXT_PUBLIC_APP_URL`.
   * Local development falls back to the Next.js development server.
   */
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  /**
   * Public support address shown in help, account, or contact surfaces.
   */
  supportEmail: "support@guidancecounselor.app",
  /**
   * Public social-profile URLs.
   *
   * Empty values indicate that the corresponding profile has not been added
   * yet. Components should avoid rendering links whose value is empty.
   */
  social: {
    x: "",
    linkedin: "",
  },
} as const
