import type { StudentAcademicPlan } from "@/types/academic.type"
import type { AcademicProgram } from "@/types/degree.type"

import { calculateEstimatedGraduation } from "./planner-terms"
import { validatePlan } from "./validate-plan"

interface RecalculateAcademicPlanArguments {
  plan: StudentAcademicPlan
  program: AcademicProgram
  initiallyCompletedCourseIds?: Set<string>
}

/**
 * Totals planned credits across all semesters.
 */
function calculatePlannedCredits(plan: StudentAcademicPlan): number {
  return plan.semesters.reduce(
    (planTotal, semester) =>
      planTotal +
      semester.courses.reduce(
        (semesterTotal, course) => semesterTotal + course.credits,
        0,
      ),
    0,
  )
}

/**
 * Recalculates totals and validation after a plan edit.
 */
export function recalculateAcademicPlan({
  plan,
  program,
  initiallyCompletedCourseIds = new Set<string>(),
}: RecalculateAcademicPlanArguments): StudentAcademicPlan {
  const totalPlannedCredits = calculatePlannedCredits(plan)

  const validation = validatePlan({
    semesters: plan.semesters,
    initiallyCompletedCourseIds,
    appliedCredits: plan.appliedCredits,
    totalPlannedCredits,
    programTotalCredits: program.totalCredits,
  })

  return {
    ...plan,
    totalPlannedCredits,
    estimatedGraduation: calculateEstimatedGraduation(plan.semesters),
    validation,
  }
}
