import type { SubjectArea } from "@/types/academic.type"

/**
 * Describes how one transcript course was applied.
 */
export interface TranscriptCreditAllocation {
  transcriptCourseId: string
  transcriptCourseTitle: string
  subjectArea: SubjectArea
  earnedCredits: number
  appliedCredits: number
  unappliedCredits: number
  requirementCourseId?: string
  requirementCourseTitle?: string
  allocationType:
    | "exact_course"
    | "subject_requirement"
    | "general_education"
    | "general_elective"
    | "unapplied"
}
