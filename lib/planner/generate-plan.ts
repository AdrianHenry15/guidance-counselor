import { randomUUID } from "crypto"

import type { StudentAcademicPlan } from "@/types/academic.type"
import type { AcademicProgram } from "@/types/degree.type"
import type { GeneratePlanOptions } from "@/types/planner.type"
import type { TranscriptCourse } from "@/types/transcript.type"

import { allocateTranscriptCourses } from "./allocate-transcript-courses"
import { expandProgramRequirements } from "./expand-requirements"
import { calculateEstimatedGraduation } from "./planner-terms"
import { scheduleCourses } from "./schedule-courses"
import { validatePlan } from "./validate-plan"

interface GenerateAcademicPlanArguments {
  program: AcademicProgram
  transcriptCourses: TranscriptCourse[]
  options: GeneratePlanOptions
}

function calculateCourseCredits(courses: Array<{ credits: number }>): number {
  return courses.reduce((total, course) => total + course.credits, 0)
}

export function generateAcademicPlan({
  program,
  transcriptCourses,
  options,
}: GenerateAcademicPlanArguments): StudentAcademicPlan {
  const includedTranscriptCourses = transcriptCourses.filter(
    (course) => course.completionStatus === "passed" && course.includedInPlan,
  )

  const completedCredits = calculateCourseCredits(includedTranscriptCourses)

  const requiredCourses = expandProgramRequirements(program)

  const requirementCredits = calculateCourseCredits(requiredCourses)

  if (requirementCredits !== program.totalCredits) {
    throw new Error(
      `Expanded requirements total ${requirementCredits} credits, but ${program.name} requires ${program.totalCredits}.`,
    )
  }

  const { completedCourseIds, remainingCourses, appliedTranscriptCredits } =
    allocateTranscriptCourses(requiredCourses, includedTranscriptCourses)

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
    educationLevel: program.level,
    semesters,
    completedCredits,
    appliedCredits: appliedTranscriptCredits,
    totalPlannedCredits,
    estimatedGraduation: calculateEstimatedGraduation(semesters),
    generatedAt: new Date().toISOString(),
    validation,
  }
}
