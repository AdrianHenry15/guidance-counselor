import { describe, expect, it } from "vitest"

import { computerScienceBachelorProgram } from "@/data/degree.data"
import { expandProgramRequirements } from "@/lib/planner/expand-requirements"

/**
 * Totals credits across expanded requirements.
 */
function totalCredits(courses: Array<{ credits: number }>): number {
  return courses.reduce((total, course) => total + course.credits, 0)
}

describe("expandProgramRequirements", () => {
  it("expands the computer science program to exactly 120 credits", () => {
    const courses = expandProgramRequirements(computerScienceBachelorProgram)

    expect(totalCredits(courses)).toBe(
      computerScienceBachelorProgram.totalCredits,
    )
  })

  it("associates every expanded course with a degree requirement", () => {
    const courses = expandProgramRequirements(computerScienceBachelorProgram)

    const requirementIds = new Set(
      computerScienceBachelorProgram.requirements.map(
        (requirement) => requirement.id,
      ),
    )

    for (const course of courses) {
      const hasRequirementTag = course.tags?.some((tag) =>
        requirementIds.has(tag),
      )

      expect(hasRequirementTag).toBe(true)
    }
  })

  it("creates unique expanded course IDs", () => {
    const courses = expandProgramRequirements(computerScienceBachelorProgram)

    const courseIds = courses.map((course) => course.id)

    expect(new Set(courseIds).size).toBe(courseIds.length)
  })
})
