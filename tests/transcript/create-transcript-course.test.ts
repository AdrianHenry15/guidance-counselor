import { describe, expect, it } from "vitest"

import { createTranscriptCourse } from "@/lib/transcript/create-transcript-course"

describe("createTranscriptCourse", () => {
  it("creates a blank manual transcript course", () => {
    const course = createTranscriptCourse()

    expect(course).toMatchObject({
      originalName: "Manually added course",
      normalizedTitle: "",
      subjectArea: "general_elective",
      credits: 3,
      completionStatus: "passed",
      includedInPlan: true,
      confidence: 1,
      source: "manual",
    })
  })

  it("creates a non-empty unique course ID", () => {
    const firstCourse = createTranscriptCourse()

    const secondCourse = createTranscriptCourse()

    expect(firstCourse.id).toEqual(expect.any(String))

    expect(firstCourse.id.length).toBeGreaterThan(0)

    expect(secondCourse.id).not.toBe(firstCourse.id)
  })

  it("creates a course that is immediately eligible for editing and planning", () => {
    const course = createTranscriptCourse()

    expect(course.completionStatus).toBe("passed")

    expect(course.includedInPlan).toBe(true)

    expect(course.source).toBe("manual")
  })
})
