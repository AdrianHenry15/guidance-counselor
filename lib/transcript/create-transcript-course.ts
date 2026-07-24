import type { TranscriptCourse } from "@/types/transcript.type"

/**
 * Creates a blank transcript course for manual entry.
 */
export function createTranscriptCourse(): TranscriptCourse {
  return {
    id: globalThis.crypto.randomUUID(),
    originalName: "Manually added course",
    normalizedTitle: "",
    subjectArea: "general_elective",
    source: "manual",
    credits: 3,
    completionStatus: "passed",
    includedInPlan: true,
    confidence: 1,
  }
}
