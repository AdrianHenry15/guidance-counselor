import { describe, expect, it } from "vitest"

import { computerScienceBachelorProgram } from "@/data/degree.data"
import { generateAcademicPlan } from "@/lib/planner/generate-plan"

import { createPlanOptions } from "@/tests/factories/plan-options.factory"
import {
  createMatchingTranscriptCourses,
  getExplicitRequiredCourses,
} from "@/tests/factories/planner-scenario.factory"
import { createTranscriptCourse } from "@/tests/factories/transcript-course.factory"

/**
 * Verifies the core credit-integrity rules shared by every generated plan.
 */
function expectValidCreditMapping(
  plan: ReturnType<typeof generateAcademicPlan>,
) {
  expect(plan.appliedCredits + plan.totalPlannedCredits).toBe(
    computerScienceBachelorProgram.totalCredits,
  )

  expect(plan.degreeAudit.totalAppliedCredits).toBe(plan.appliedCredits)

  expect(plan.degreeAudit.totalRemainingCredits).toBe(plan.totalPlannedCredits)

  expect(plan.validation.errorCount).toBe(0)
}

describe("V1 planner scenarios", () => {
  it("builds a complete plan with no prior credits", () => {
    const plan = generateAcademicPlan({
      program: computerScienceBachelorProgram,
      transcriptCourses: [],
      options: createPlanOptions(),
    })

    expect(plan.completedCredits).toBe(0)
    expect(plan.appliedCredits).toBe(0)
    expect(plan.totalPlannedCredits).toBe(120)

    expectValidCreditMapping(plan)
  })

  it("applies exact transcript matches and reduces remaining credits", () => {
    const explicitCourses = getExplicitRequiredCourses().slice(0, 4)

    const transcriptCourses = createMatchingTranscriptCourses(explicitCourses)

    const expectedCredits = transcriptCourses.reduce(
      (total, course) => total + course.credits,
      0,
    )

    const plan = generateAcademicPlan({
      program: computerScienceBachelorProgram,
      transcriptCourses,
      options: createPlanOptions(),
    })

    expect(plan.completedCredits).toBe(expectedCredits)

    expect(plan.appliedCredits).toBe(expectedCredits)

    expect(plan.totalPlannedCredits).toBe(120 - expectedCredits)

    expect(plan.transcriptAllocations).toHaveLength(transcriptCourses.length)

    expectValidCreditMapping(plan)
  })

  it("ignores failed and excluded coursework", () => {
    const explicitCourse = getExplicitRequiredCourses()[0]

    expect(explicitCourse).toBeDefined()

    const failedCourse = createTranscriptCourse({
      id: "failed-course",
      title: explicitCourse!.title,
      subjectArea: explicitCourse!.subjectArea,
      credits: explicitCourse!.credits,
      completionStatus: "failed",
    })

    const excludedCourse = createTranscriptCourse({
      id: "excluded-course",
      title: explicitCourse!.title,
      subjectArea: explicitCourse!.subjectArea,
      credits: explicitCourse!.credits,
      includedInPlan: false,
    })

    const plan = generateAcademicPlan({
      program: computerScienceBachelorProgram,
      transcriptCourses: [failedCourse, excludedCourse],
      options: createPlanOptions(),
    })

    expect(plan.completedCredits).toBe(0)
    expect(plan.appliedCredits).toBe(0)
    expect(plan.totalPlannedCredits).toBe(120)

    expect(plan.transcriptAllocations).toHaveLength(0)

    expectValidCreditMapping(plan)
  })

  it("applies generalized education coursework to compatible requirements", () => {
    const transcriptCourses = [
      createTranscriptCourse({
        id: "psychology",
        title: "Introduction to Psychology",
        subjectArea: "social_science",
        credits: 3,
      }),
      createTranscriptCourse({
        id: "art-history",
        title: "Art History",
        subjectArea: "fine_arts",
        credits: 3,
      }),
      createTranscriptCourse({
        id: "humanities",
        title: "Introduction to Humanities",
        subjectArea: "humanities",
        credits: 3,
      }),
    ]

    const plan = generateAcademicPlan({
      program: computerScienceBachelorProgram,
      transcriptCourses,
      options: createPlanOptions(),
    })

    expect(plan.completedCredits).toBe(9)
    expect(plan.appliedCredits).toBe(9)
    expect(plan.totalPlannedCredits).toBe(111)

    for (const allocation of plan.transcriptAllocations) {
      expect(allocation.appliedCredits).toBe(3)

      expect([
        "subject_requirement",
        "general_education",
        "general_elective",
      ]).toContain(allocation.allocationType)
    }

    expectValidCreditMapping(plan)
  })

  it("records earned credits that exceed available degree capacity", () => {
    const explicitCourses = getExplicitRequiredCourses()

    const matchingCourses = createMatchingTranscriptCourses(explicitCourses)

    /*
     * Extra coursework remains earned even when the selected program has no
     * remaining compatible degree capacity for all of it.
     */
    const extraCourses = Array.from({ length: 30 }, (_, index) =>
      createTranscriptCourse({
        id: `extra-course-${index}`,
        title: `Extra Course ${index + 1}`,
        subjectArea: "general_elective",
        credits: 3,
      }),
    )

    const plan = generateAcademicPlan({
      program: computerScienceBachelorProgram,
      transcriptCourses: [...matchingCourses, ...extraCourses],
      options: createPlanOptions(),
    })

    expect(plan.completedCredits).toBeGreaterThanOrEqual(plan.appliedCredits)

    const unappliedCredits = plan.transcriptAllocations.reduce(
      (total, allocation) => total + allocation.unappliedCredits,
      0,
    )

    expect(unappliedCredits).toBeGreaterThan(0)

    expectValidCreditMapping(plan)
  })

  it("respects a plan without summer semesters", () => {
    const plan = generateAcademicPlan({
      program: computerScienceBachelorProgram,
      transcriptCourses: [],
      options: createPlanOptions({
        includeSummer: false,
      }),
    })

    expect(plan.semesters.some((semester) => semester.term === "summer")).toBe(
      false,
    )

    expectValidCreditMapping(plan)
  })

  it("respects the selected start term and year", () => {
    const plan = generateAcademicPlan({
      program: computerScienceBachelorProgram,
      transcriptCourses: [],
      options: createPlanOptions({
        startTerm: "spring",
        startYear: 2028,
      }),
    })

    const firstSemester = plan.semesters[0]

    expect(firstSemester).toBeDefined()
    expect(firstSemester?.term).toBe("spring")
    expect(firstSemester?.year).toBe(2028)

    expectValidCreditMapping(plan)
  })
})
