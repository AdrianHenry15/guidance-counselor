import type { GeneralizedCourse } from "@/types/academic.type"
import type { DegreeRequirement } from "@/types/degree.type"

/**
 * Finds the parent degree requirement for an expanded course.
 */
export function findCourseRequirement(
  course: GeneralizedCourse,
  requirements: DegreeRequirement[],
): DegreeRequirement | undefined {
  return requirements.find((requirement) =>
    course.tags?.includes(requirement.id),
  )
}
