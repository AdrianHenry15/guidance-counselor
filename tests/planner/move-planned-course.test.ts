import { describe, expect, it } from "vitest"

import { sampleAcademicPlan } from "@/data/sample-plan"
import { movePlannedCourse } from "@/lib/planner/move-planner-course"

describe("movePlannedCourse", () => {
  it("moves a course between semesters without mutating the original plan", () => {
    const sourceSemester = sampleAcademicPlan.semesters[0]

    const targetSemester = sampleAcademicPlan.semesters[1]

    const course = sourceSemester?.courses[0]

    expect(sourceSemester).toBeDefined()
    expect(targetSemester).toBeDefined()
    expect(course).toBeDefined()

    const updatedPlan = movePlannedCourse({
      plan: sampleAcademicPlan,
      courseId: course!.id,
      sourceSemesterId: sourceSemester!.id,
      targetSemesterId: targetSemester!.id,
    })

    expect(
      updatedPlan.semesters[0].courses.some((item) => item.id === course!.id),
    ).toBe(false)

    expect(
      updatedPlan.semesters[1].courses.some((item) => item.id === course!.id),
    ).toBe(true)

    expect(
      sampleAcademicPlan.semesters[0].courses.some(
        (item) => item.id === course!.id,
      ),
    ).toBe(true)
  })

  it("returns the same plan when source and target are identical", () => {
    const semester = sampleAcademicPlan.semesters[0]

    const course = semester?.courses[0]

    const result = movePlannedCourse({
      plan: sampleAcademicPlan,
      courseId: course!.id,
      sourceSemesterId: semester!.id,
      targetSemesterId: semester!.id,
    })

    expect(result).toBe(sampleAcademicPlan)
  })
})
