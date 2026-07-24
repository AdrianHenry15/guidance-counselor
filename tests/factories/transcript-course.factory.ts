import type {
  TranscriptCompletionStatus,
  TranscriptCourse,
} from "@/types/transcript.type"
import type { SubjectArea } from "@/types/academic.type"

interface CreateTranscriptCourseOptions {
  id?: string
  title?: string
  subjectArea?: SubjectArea
  credits?: number
  completionStatus?: TranscriptCompletionStatus
  includedInPlan?: boolean
}

/**
 * Creates predictable transcript courses for planner tests.
 */
export function createTranscriptCourse({
  id = "transcript-course-1",
  title = "Test Course",
  subjectArea = "general_elective",
  credits = 3,
  completionStatus = "passed",
  includedInPlan = true,
}: CreateTranscriptCourseOptions = {}): TranscriptCourse {
  return {
    id,
    originalName: title,
    normalizedTitle: title,
    subjectArea,
    credits,
    completionStatus,
    includedInPlan,
    confidence: 1,
    source: "manual",
  }
}
