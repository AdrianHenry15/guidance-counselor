import type { GeneralizedCourse } from "@/types/academic.type"
import type { TranscriptCourse } from "@/types/transcript.type"

export function normalizeComparisonValue(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "")
}

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

export function isGeneratedRequirement(course: GeneralizedCourse): boolean {
  return course.tags?.includes("generated-requirement") ?? false
}

export function isGeneralEducationPlaceholder(
  course: GeneralizedCourse,
): boolean {
  return course.tags?.includes("general-education") ?? false
}
