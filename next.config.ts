import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["pdfjs-dist"],

  /**
   * Ensures the PDF.js worker is included in production/serverless output.
   */
  outputFileTracingIncludes: {
    "/api/transcript/analyze": [
      "./node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs",
    ],
  },
}

export default nextConfig
