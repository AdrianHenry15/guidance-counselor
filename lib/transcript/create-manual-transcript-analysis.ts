import type { TranscriptAnalysis } from "@/types/transcript.type"

/**
 * Creates an empty transcript analysis for manual course entry.
 */
export function createManualTranscriptAnalysis(): TranscriptAnalysis {
  return {
    id: globalThis.crypto.randomUUID(),
    fileName: "Manual transcript",
    fileType: "text",
    educationLevel: "college",
    estimatedCreditsEarned: 0,
    courses: [],
    warnings: [],
    analyzedAt: new Date().toISOString(),
  }
}
