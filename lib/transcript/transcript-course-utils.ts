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
