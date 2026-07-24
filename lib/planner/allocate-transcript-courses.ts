import type { GeneralizedCourse, SubjectArea } from "@/types/academic.type"
import type { TranscriptCourse } from "@/types/transcript.type"

import {
  courseMatchesTranscript,
  isGeneralEducationPlaceholder,
  isGeneratedRequirement,
} from "./course-matching"
import { TranscriptCreditAllocation } from "@/types/credit-allocation.type"

/**
 * Tracks whether a transcript course has already been allocated.
 */
interface TranscriptCandidate {
  course: TranscriptCourse
  used: boolean
}

/**
 * Result of applying transcript credits to degree requirements.
 */
export interface RequirementAllocation {
  completedCourseIds: Set<string>
  remainingCourses: GeneralizedCourse[]
  appliedTranscriptCredits: number
  transcriptAllocations: TranscriptCreditAllocation[]
}

/**
 * Subjects eligible for general education placeholders.
 */
const generalEducationSubjects = new Set<SubjectArea>([
  "english",
  "humanities",
  "social_science",
  "foreign_language",
  "fine_arts",
])

/**
 * Determines whether a transcript course can satisfy a generated placeholder.
 */
function canSatisfyPlaceholder(
  transcriptCourse: TranscriptCourse,
  requirementCourse: GeneralizedCourse,
): boolean {
  if (!isGeneratedRequirement(requirementCourse)) {
    return false
  }

  if (requirementCourse.subjectArea === transcriptCourse.subjectArea) {
    return true
  }

  if (requirementCourse.subjectArea === "general_elective") {
    return true
  }

  return (
    isGeneralEducationPlaceholder(requirementCourse) &&
    generalEducationSubjects.has(transcriptCourse.subjectArea)
  )
}

/**
 * Applies available transcript credits to one placeholder.
 */
function applyCreditsToPlaceholder(
  placeholder: GeneralizedCourse,
  availableCredits: number,
): {
  remainingCourse: GeneralizedCourse | null
  appliedCredits: number
} {
  const appliedCredits = Math.min(placeholder.credits, availableCredits)

  const remainingCredits = placeholder.credits - appliedCredits

  if (remainingCredits <= 0) {
    return {
      remainingCourse: null,
      appliedCredits,
    }
  }

  return {
    remainingCourse: {
      ...placeholder,
      credits: remainingCredits,
      title: `${placeholder.title} — Remaining`,
    },
    appliedCredits,
  }
}

/**
 * Allocates eligible transcript courses to degree requirements.
 *
 * Exact named-course matches are processed before generalized placeholders.
 */
export function allocateTranscriptCourses(
  requiredCourses: GeneralizedCourse[],
  transcriptCourses: TranscriptCourse[],
): RequirementAllocation {
  const transcriptAllocations: TranscriptCreditAllocation[] = []
  const candidates: TranscriptCandidate[] = transcriptCourses
    .filter(
      (course) => course.completionStatus === "passed" && course.includedInPlan,
    )
    .map((course) => ({
      course,
      used: false,
    }))

  const completedCourseIds = new Set<string>()

  const coursesAfterExactMatching: GeneralizedCourse[] = []

  let appliedTranscriptCredits = 0

  /**
   * First pass: allocate transcript courses to exact named requirements.
   */
  for (const requiredCourse of requiredCourses) {
    if (isGeneratedRequirement(requiredCourse)) {
      coursesAfterExactMatching.push(requiredCourse)
      continue
    }

    const match = candidates.find(
      (candidate) =>
        !candidate.used &&
        courseMatchesTranscript(requiredCourse, candidate.course),
    )

    if (!match) {
      coursesAfterExactMatching.push(requiredCourse)
      continue
    }

    match.used = true

    completedCourseIds.add(requiredCourse.id)

    const appliedCredits = Math.min(
      match.course.credits,
      requiredCourse.credits,
    )

    appliedTranscriptCredits += appliedCredits

    transcriptAllocations.push({
      transcriptCourseId: match.course.id,
      transcriptCourseTitle: match.course.normalizedTitle,
      subjectArea: match.course.subjectArea,
      earnedCredits: match.course.credits,
      appliedCredits,
      unappliedCredits: match.course.credits - appliedCredits,
      requirementCourseId: requiredCourse.id,
      requirementCourseTitle: requiredCourse.title,
      allocationType: "exact_course",
    })
  }

  const remainingCourses = [...coursesAfterExactMatching]

  /**
   * Second pass: apply unmatched transcript credits to compatible placeholders.
   */
  for (const candidate of candidates) {
    if (candidate.used) {
      continue
    }

    let creditsRemaining = candidate.course.credits

    /**
     * Prefer same-subject placeholders, then general education,
     * then unrestricted electives.
     */
    const compatibleIndexes = remainingCourses
      .map((course, index) => ({
        course,
        index,
        priority:
          course.subjectArea === candidate.course.subjectArea
            ? 0
            : isGeneralEducationPlaceholder(course)
              ? 1
              : course.subjectArea === "general_elective"
                ? 2
                : 3,
      }))
      .filter(({ course }) => canSatisfyPlaceholder(candidate.course, course))
      .sort((a, b) => a.priority - b.priority)
      .map(({ index }) => index)

    for (const index of compatibleIndexes) {
      if (creditsRemaining <= 0) {
        break
      }

      const placeholder = remainingCourses[index]

      if (!placeholder) {
        continue
      }

      const result = applyCreditsToPlaceholder(placeholder, creditsRemaining)
      let candidateAppliedCredits = 0
      let firstRequirementCourse: GeneralizedCourse | undefined

      if (result.appliedCredits > 0 && !firstRequirementCourse) {
        firstRequirementCourse = placeholder
      }

      candidateAppliedCredits += result.appliedCredits

      creditsRemaining -= result.appliedCredits

      appliedTranscriptCredits += result.appliedCredits

      const allocationType =
        candidateAppliedCredits === 0
          ? "unapplied"
          : firstRequirementCourse?.subjectArea === candidate.course.subjectArea
            ? "subject_requirement"
            : isGeneralEducationPlaceholder(firstRequirementCourse!)
              ? "general_education"
              : "general_elective"

      transcriptAllocations.push({
        transcriptCourseId: candidate.course.id,
        transcriptCourseTitle: candidate.course.normalizedTitle,
        subjectArea: candidate.course.subjectArea,
        earnedCredits: candidate.course.credits,
        appliedCredits: candidateAppliedCredits,
        unappliedCredits: candidate.course.credits - candidateAppliedCredits,
        requirementCourseId: firstRequirementCourse?.id,
        requirementCourseTitle: firstRequirementCourse?.title,
        allocationType,
      })

      remainingCourses[index] = result.remainingCourse ?? {
        ...placeholder,
        credits: 0,
      }
    }
  }

  return {
    completedCourseIds,
    appliedTranscriptCredits,
    transcriptAllocations,
    remainingCourses: remainingCourses.filter((course) => course.credits > 0),
  }
}
