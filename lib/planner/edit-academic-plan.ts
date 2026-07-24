import type { StudentAcademicPlan } from "@/types/academic.type"

import { recalculateAcademicPlan } from "./recalculate-academic-plan"
import { getAcademicProgram } from "@/data/program"
import { movePlannedCourse } from "./move-planner-course"

interface MoveCourseInPlanArguments {
  plan: StudentAcademicPlan
  courseId: string
  sourceSemesterId: string
  targetSemesterId: string
}

/**
 * Moves a course and recalculates the resulting academic plan.
 */
export function moveCourseInPlan({
  plan,
  courseId,
  sourceSemesterId,
  targetSemesterId,
}: MoveCourseInPlanArguments): StudentAcademicPlan {
  const program = getAcademicProgram(plan.programId)

  if (!program) {
    throw new Error("The academic program for this plan could not be found.")
  }

  const movedPlan = movePlannedCourse({
    plan,
    courseId,
    sourceSemesterId,
    targetSemesterId,
  })

  return recalculateAcademicPlan({
    plan: movedPlan,
    program,
    initiallyCompletedCourseIds: new Set(plan.completedCourseIds),
  })
}
