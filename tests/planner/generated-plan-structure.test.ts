import { describe, expect, it } from "vitest"

import { computerScienceBachelorProgram } from "@/data/degree.data"
import { generateAcademicPlan } from "@/lib/planner/generate-plan"
import { createPlanOptions } from "@/tests/factories/plan-options.factory"

describe("generated plan structure", () => {
  it("creates unique semester IDs", () => {
    const plan = generateAcademicPlan({
      program: computerScienceBachelorProgram,
      transcriptCourses: [],
      options: createPlanOptions(),
    })

    const semesterIds = plan.semesters.map((semester) => semester.id)

    expect(new Set(semesterIds).size).toBe(semesterIds.length)
  })

  it("schedules every remaining course exactly once", () => {
    const plan = generateAcademicPlan({
      program: computerScienceBachelorProgram,
      transcriptCourses: [],
      options: createPlanOptions(),
    })

    const courseIds = plan.semesters.flatMap((semester) =>
      semester.courses.map((course) => course.id),
    )

    expect(new Set(courseIds).size).toBe(courseIds.length)
  })

  it("keeps semesters in chronological order", () => {
    const plan = generateAcademicPlan({
      program: computerScienceBachelorProgram,
      transcriptCourses: [],
      options: createPlanOptions(),
    })

    const termOrder = {
      spring: 0,
      summer: 1,
      fall: 2,
    }

    for (let index = 1; index < plan.semesters.length; index += 1) {
      const previous = plan.semesters[index - 1]

      const current = plan.semesters[index]

      expect(previous).toBeDefined()
      expect(current).toBeDefined()

      const previousPosition = previous!.year * 10 + termOrder[previous!.term]

      const currentPosition = current!.year * 10 + termOrder[current!.term]

      expect(currentPosition).toBeGreaterThan(previousPosition)
    }
  })
})
