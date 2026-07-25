import { describe, expect, it } from "vitest"

import { computerScienceBachelorProgram } from "@/data/degree.data"
import { generateAcademicPlan } from "@/lib/planner/generate-plan"
import type { GeneratePlanOptions } from "@/types/planner.type"
import { createTranscriptCourse } from "@/tests/factories/transcript-course.factory"

const options: GeneratePlanOptions = {
  programId: computerScienceBachelorProgram.id,
  priorCredential: "none",
  startTerm: "fall",
  startYear: 2027,
  fallSpringCreditTarget: 12,
  summerCreditTarget: 6,
  includeSummer: true,
}

describe("generateAcademicPlan", () => {
  it("generates a complete 120-credit plan without transcript credits", () => {
    const plan = generateAcademicPlan({
      program: computerScienceBachelorProgram,
      transcriptCourses: [],
      options,
    })

    expect(plan.appliedCredits).toBe(0)
    expect(plan.totalPlannedCredits).toBe(120)

    expect(plan.appliedCredits + plan.totalPlannedCredits).toBe(
      computerScienceBachelorProgram.totalCredits,
    )

    expect(plan.validation.isValid).toBe(true)
  })

  it("reduces planned credits when transcript credits are applied", () => {
    const transcriptCourse = createTranscriptCourse({
      title: "English Composition I",
      subjectArea: "english",
      credits: 3,
    })

    const plan = generateAcademicPlan({
      program: computerScienceBachelorProgram,
      transcriptCourses: [transcriptCourse],
      options,
    })

    expect(plan.appliedCredits).toBe(3)

    expect(plan.totalPlannedCredits).toBe(117)

    expect(plan.appliedCredits + plan.totalPlannedCredits).toBe(120)
  })

  it("keeps audit totals synchronized with applied credits", () => {
    const transcriptCourse = createTranscriptCourse({
      title: "English Composition I",
      subjectArea: "english",
      credits: 3,
    })

    const plan = generateAcademicPlan({
      program: computerScienceBachelorProgram,
      transcriptCourses: [transcriptCourse],
      options,
    })

    expect(plan.degreeAudit.totalAppliedCredits).toBe(plan.appliedCredits)

    expect(plan.degreeAudit.totalRemainingCredits).toBe(
      plan.totalPlannedCredits,
    )
  })
})
