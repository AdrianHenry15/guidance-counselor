import type { TranscriptCourse } from "@/types/transcript.type"

export function isIncludedPassedCourse(course: TranscriptCourse): boolean {
  return course.completionStatus === "passed" && course.includedInPlan
}

export function getIncludedPassedCourses(
  courses: TranscriptCourse[],
): TranscriptCourse[] {
  return courses.filter(isIncludedPassedCourse)
}

export function calculateIncludedCredits(courses: TranscriptCourse[]): number {
  return getIncludedPassedCourses(courses).reduce(
    (total, course) => total + course.credits,
    0,
  )
}

export function calculateIncludedCourseCount(
  courses: TranscriptCourse[],
): number {
  return getIncludedPassedCourses(courses).length
}

/**
 * Returns passed and included courses that cannot be sent to the planner.
 */
export function getInvalidIncludedCourses(
  courses: TranscriptCourse[],
): TranscriptCourse[] {
  return getIncludedPassedCourses(courses).filter((course) => {
    const hasValidTitle = course.normalizedTitle.trim().length > 0

    const hasValidCredits =
      Number.isFinite(course.credits) && course.credits > 0

    return !hasValidTitle || !hasValidCredits
  })
}
