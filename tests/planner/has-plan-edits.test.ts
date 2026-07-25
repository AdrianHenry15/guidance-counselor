import { describe, expect, it } from "vitest"

import { sampleAcademicPlan } from "@/data/sample-plan"
import { hasPlanEdits } from "@/lib/planner/has-plan-edits"
import { movePlannedCourse } from "@/lib/planner/move-planner-course"

describe("hasPlanEdits", () => {
  it("returns false for identical plans", () => {
    expect(hasPlanEdits(sampleAcademicPlan, sampleAcademicPlan)).toBe(false)
  })

  it("returns true after a course moves semesters", () => {
    const sourceSemester = sampleAcademicPlan.semesters[0]

    const targetSemester = sampleAcademicPlan.semesters[1]

    const course = sourceSemester?.courses[0]

    expect(sourceSemester).toBeDefined()
    expect(targetSemester).toBeDefined()
    expect(course).toBeDefined()

    const editedPlan = movePlannedCourse({
      plan: sampleAcademicPlan,
      courseId: course!.id,
      sourceSemesterId: sourceSemester!.id,
      targetSemesterId: targetSemester!.id,
    })

    expect(hasPlanEdits(editedPlan, sampleAcademicPlan)).toBe(true)
  })

  it("returns false when a course returns to its original semester", () => {
    const firstSemester = sampleAcademicPlan.semesters[0]

    const secondSemester = sampleAcademicPlan.semesters[1]

    const course = firstSemester?.courses[0]

    expect(firstSemester).toBeDefined()
    expect(secondSemester).toBeDefined()
    expect(course).toBeDefined()

    const movedPlan = movePlannedCourse({
      plan: sampleAcademicPlan,
      courseId: course!.id,
      sourceSemesterId: firstSemester!.id,
      targetSemesterId: secondSemester!.id,
    })

    const restoredPlan = movePlannedCourse({
      plan: movedPlan,
      courseId: course!.id,
      sourceSemesterId: secondSemester!.id,
      targetSemesterId: firstSemester!.id,
    })

    expect(hasPlanEdits(restoredPlan, sampleAcademicPlan)).toBe(false)
  })
})
