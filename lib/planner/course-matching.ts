import type { GeneralizedCourse } from "@/types/academic.type"
import type { TranscriptCourse } from "@/types/transcript.type"

/**
 * Normalizes titles for exact, punctuation-insensitive comparison.
 */
export function normalizeComparisonValue(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "")
}

/**
 * Checks whether a planned course exactly matches a transcript title.
 */
export function courseMatchesTranscript(
  course: GeneralizedCourse,
  transcriptCourse: TranscriptCourse,
): boolean {
  const plannedTitle = normalizeComparisonValue(course.title)

  const normalizedTranscriptTitle = normalizeComparisonValue(
    transcriptCourse.normalizedTitle,
  )

  const originalTranscriptTitle = normalizeComparisonValue(
    transcriptCourse.originalName,
  )

  return (
    plannedTitle === normalizedTranscriptTitle ||
    plannedTitle === originalTranscriptTitle
  )
}

/**
 * Identifies requirement placeholders created during expansion.
 */
export function isGeneratedRequirement(course: GeneralizedCourse): boolean {
  return course.tags?.includes("generated-requirement") ?? false
}

/**
 * Identifies generated general education placeholders.
 */
export function isGeneralEducationPlaceholder(
  course: GeneralizedCourse,
): boolean {
  return course.tags?.includes("general-education") ?? false
}
