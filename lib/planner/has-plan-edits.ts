import type { StudentAcademicPlan } from "@/types/academic.type"

/**
 * Creates a stable course-to-semester map for plan comparison.
 */
function createCourseSemesterMap(
  plan: StudentAcademicPlan,
): Map<string, string> {
  const courseSemesterMap = new Map<string, string>()

  for (const semester of plan.semesters) {
    for (const course of semester.courses) {
      courseSemesterMap.set(course.id, semester.id)
    }
  }

  return courseSemesterMap
}

/**
 * Determines whether courses have moved from the original generated plan.
 */
export function hasPlanEdits(
  currentPlan: StudentAcademicPlan,
  originalPlan: StudentAcademicPlan,
): boolean {
  const currentCourseMap = createCourseSemesterMap(currentPlan)

  const originalCourseMap = createCourseSemesterMap(originalPlan)

  if (currentCourseMap.size !== originalCourseMap.size) {
    return true
  }

  for (const [courseId, semesterId] of currentCourseMap) {
    if (originalCourseMap.get(courseId) !== semesterId) {
      return true
    }
  }

  return false
}
