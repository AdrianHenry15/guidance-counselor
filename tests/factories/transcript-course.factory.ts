import type { SubjectArea } from "@/types/academic.type"
import type {
  TranscriptCompletionStatus,
  TranscriptCourse,
  TranscriptCourseSource,
} from "@/types/transcript.type"

interface CreateTranscriptCourseOptions {
  id?: string
  title?: string
  originalName?: string
  normalizedTitle?: string
  subjectArea?: SubjectArea
  credits?: number
  grade?: string
  completionStatus?: TranscriptCompletionStatus
  includedInPlan?: boolean
  institution?: string
  term?: string
  year?: string
  confidence?: number
  source?: TranscriptCourseSource
}

/**
 * Creates predictable transcript courses for tests.
 */
export function createTranscriptCourse({
  id = "transcript-course-1",
  title = "Test Course",
  originalName,
  normalizedTitle,
  subjectArea = "general_elective",
  credits = 3,
  grade,
  completionStatus = "passed",
  includedInPlan = true,
  institution,
  term,
  year,
  confidence = 1,
  source = "manual",
}: CreateTranscriptCourseOptions = {}): TranscriptCourse {
  return {
    id,
    originalName: originalName ?? title,
    normalizedTitle: normalizedTitle ?? title,
    subjectArea,
    credits,
    grade,
    completionStatus,
    includedInPlan,
    institution,
    term,
    year,
    confidence,
    source,
  }
}
