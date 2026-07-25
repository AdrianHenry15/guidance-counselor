import { computerScienceBachelorProgram } from "@/data/degree.data"
import { expandProgramRequirements } from "@/lib/planner/expand-requirements"
import type { GeneralizedCourse } from "@/types/academic.type"
import type { TranscriptCourse } from "@/types/transcript.type"

import { createTranscriptCourse } from "./transcript-course.factory"

/**
 * Returns explicit named courses from the selected degree program.
 *
 * Generated requirement placeholders are excluded because transcript courses
 * should represent real completed courses rather than planner placeholders.
 */
export function getExplicitRequiredCourses(): GeneralizedCourse[] {
  return expandProgramRequirements(computerScienceBachelorProgram).filter(
    (course) => !course.tags?.includes("generated-requirement"),
  )
}

/**
 * Converts degree requirements into matching transcript courses.
 */
export function createMatchingTranscriptCourses(
  courses: GeneralizedCourse[],
): TranscriptCourse[] {
  return courses.map((course, index) =>
    createTranscriptCourse({
      id: `transcript-match-${index}`,
      title: course.title,
      subjectArea: course.subjectArea,
      credits: course.credits,
    }),
  )
}
