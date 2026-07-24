import { randomUUID } from "crypto"

import type { StudentAcademicPlan } from "@/types/academic.type"
import type { AcademicProgram } from "@/types/degree.type"
import type { GeneratePlanOptions } from "@/types/planner.type"
import type { TranscriptCourse } from "@/types/transcript.type"

import { allocateTranscriptCourses } from "./allocate-transcript-courses"
import { createDegreeAudit } from "./create-degree-audit"
import { expandProgramRequirements } from "./expand-requirements"
import { calculateEstimatedGraduation } from "./planner-terms"
import { scheduleCourses } from "./schedule-courses"
import { validatePlan } from "./validate-plan"

/**
 * Inputs required to generate a personalized academic plan.
 */
interface GenerateAcademicPlanArguments {
  program: AcademicProgram
  transcriptCourses: TranscriptCourse[]
  options: GeneratePlanOptions
}

/**
 * Totals credits across any course-like collection.
 */
function calculateCourseCredits(courses: Array<{ credits: number }>): number {
  return courses.reduce((total, course) => total + course.credits, 0)
}

/**
 * Builds a deterministic semester plan from transcript data and program rules.
 */
export function generateAcademicPlan({
  program,
  transcriptCourses,
  options,
}: GenerateAcademicPlanArguments): StudentAcademicPlan {
  /**
   * Only passed courses included by the user are considered.
   */
  const includedTranscriptCourses = transcriptCourses.filter(
    (course) => course.completionStatus === "passed" && course.includedInPlan,
  )

  const completedCredits = calculateCourseCredits(includedTranscriptCourses)

  /**
   * Expand broad requirements into schedulable courses.
   */
  const requiredCourses = expandProgramRequirements(program)

  const requirementCredits = calculateCourseCredits(requiredCourses)

  if (requirementCredits !== program.totalCredits) {
    throw new Error(
      `Expanded requirements total ${requirementCredits} credits, but ${program.name} requires ${program.totalCredits}.`,
    )
  }

  /**
   * Apply transcript credits before scheduling remaining requirements.
   */
  const {
    completedCourseIds,
    remainingCourses,
    appliedTranscriptCredits,
    appliedCreditsByRequirementId,
    transcriptAllocations,
  } = allocateTranscriptCourses({
    requiredCourses,
    transcriptCourses: includedTranscriptCourses,
    requirements: program.requirements,
  })

  /**
   * Build requirement-level progress from applied transcript credits.
   */
  const degreeAudit = createDegreeAudit({
    program,
    appliedCreditsByRequirementId,
  })

  /**
   * Preserve transcript-completed IDs for later validation.
   */
  const completedCourseIdsBeforeScheduling = new Set(completedCourseIds)

  const semesters = scheduleCourses({
    courses: remainingCourses,
    completedCourseIds,
    options,
  })

  const totalPlannedCredits = semesters.reduce(
    (total, semester) => total + calculateCourseCredits(semester.courses),
    0,
  )

  const validation = validatePlan({
    semesters,
    initiallyCompletedCourseIds: completedCourseIdsBeforeScheduling,
    appliedCredits: appliedTranscriptCredits,
    totalPlannedCredits,
    programTotalCredits: program.totalCredits,
  })

  const mappedCredits = appliedTranscriptCredits + totalPlannedCredits

  if (mappedCredits !== program.totalCredits) {
    throw new Error(
      `Generated plan maps ${mappedCredits} of ${program.totalCredits} required credits.`,
    )
  }

  return {
    id: randomUUID(),
    studentId: "local-student",
    programId: program.id,
    programName: program.name,
    educationLevel: program.level,
    semesters,
    completedCourseIds: [...completedCourseIdsBeforeScheduling],
    completedCredits,
    appliedCredits: appliedTranscriptCredits,
    totalPlannedCredits,
    transcriptAllocations,
    degreeAudit,
    estimatedGraduation: calculateEstimatedGraduation(semesters),
    generatedAt: new Date().toISOString(),
    validation,
  }
}
