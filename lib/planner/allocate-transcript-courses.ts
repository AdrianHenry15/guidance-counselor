import type { GeneralizedCourse, SubjectArea } from "@/types/academic.type"
import type { TranscriptCourse } from "@/types/transcript.type"

import {
  courseMatchesTranscript,
  isGeneralEducationPlaceholder,
  isGeneratedRequirement,
} from "./course-matching"

interface TranscriptCandidate {
  course: TranscriptCourse
  used: boolean
}

export interface RequirementAllocation {
  completedCourseIds: Set<string>
  remainingCourses: GeneralizedCourse[]
  appliedTranscriptCredits: number
}

const generalEducationSubjects = new Set<SubjectArea>([
  "english",
  "humanities",
  "social_science",
  "foreign_language",
  "fine_arts",
])

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

export function allocateTranscriptCourses(
  requiredCourses: GeneralizedCourse[],
  transcriptCourses: TranscriptCourse[],
): RequirementAllocation {
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

    appliedTranscriptCredits += Math.min(
      match.course.credits,
      requiredCourse.credits,
    )
  }

  const remainingCourses = [...coursesAfterExactMatching]

  for (const candidate of candidates) {
    if (candidate.used) {
      continue
    }

    let creditsRemaining = candidate.course.credits

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

      creditsRemaining -= result.appliedCredits

      appliedTranscriptCredits += result.appliedCredits

      remainingCourses[index] = result.remainingCourse ?? {
        ...placeholder,
        credits: 0,
      }
    }
  }

  return {
    completedCourseIds,
    appliedTranscriptCredits,
    remainingCourses: remainingCourses.filter((course) => course.credits > 0),
  }
}
