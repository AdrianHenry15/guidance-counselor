import { describe, expect, it } from "vitest"

import {
  calculateIncludedCourseCount,
  calculateIncludedCredits,
  getIncludedPassedCourses,
  getInvalidIncludedCourses,
  isIncludedPassedCourse,
} from "@/lib/transcript/transcript-course-utils"
import { createTranscriptCourse } from "@/tests/factories/transcript-course.factory"

describe("transcript course utilities", () => {
  describe("isIncludedPassedCourse", () => {
    it("returns true for a passed included course", () => {
      const course = createTranscriptCourse({
        completionStatus: "passed",
        includedInPlan: true,
      })

      expect(isIncludedPassedCourse(course)).toBe(true)
    })

    it("returns false for a passed excluded course", () => {
      const course = createTranscriptCourse({
        completionStatus: "passed",
        includedInPlan: false,
      })

      expect(isIncludedPassedCourse(course)).toBe(false)
    })

    it("returns false for a non-passed course", () => {
      const course = createTranscriptCourse({
        completionStatus: "failed",
        includedInPlan: true,
      })

      expect(isIncludedPassedCourse(course)).toBe(false)
    })
  })

  describe("getIncludedPassedCourses", () => {
    it("returns only passed and included courses", () => {
      const includedCourse = createTranscriptCourse({
        id: "included-course",
        completionStatus: "passed",
        includedInPlan: true,
      })

      const courses = [
        includedCourse,
        createTranscriptCourse({
          id: "excluded-course",
          completionStatus: "passed",
          includedInPlan: false,
        }),
        createTranscriptCourse({
          id: "failed-course",
          completionStatus: "failed",
          includedInPlan: true,
        }),
        createTranscriptCourse({
          id: "in-progress-course",
          completionStatus: "in_progress",
          includedInPlan: true,
        }),
      ]

      expect(getIncludedPassedCourses(courses)).toEqual([includedCourse])
    })

    it("returns an empty array when no courses qualify", () => {
      const courses = [
        createTranscriptCourse({
          includedInPlan: false,
        }),
        createTranscriptCourse({
          id: "failed-course",
          completionStatus: "failed",
        }),
      ]

      expect(getIncludedPassedCourses(courses)).toEqual([])
    })
  })

  describe("calculateIncludedCredits", () => {
    it("adds credits only from passed included courses", () => {
      const courses = [
        createTranscriptCourse({
          id: "included-three",
          credits: 3,
        }),
        createTranscriptCourse({
          id: "included-four",
          credits: 4,
        }),
        createTranscriptCourse({
          id: "excluded-course",
          credits: 3,
          includedInPlan: false,
        }),
        createTranscriptCourse({
          id: "failed-course",
          credits: 3,
          completionStatus: "failed",
          includedInPlan: true,
        }),
      ]

      expect(calculateIncludedCredits(courses)).toBe(7)
    })

    it("supports fractional credits", () => {
      const courses = [
        createTranscriptCourse({
          id: "three-credit-course",
          credits: 3,
        }),
        createTranscriptCourse({
          id: "fractional-course",
          credits: 1.5,
        }),
      ]

      expect(calculateIncludedCredits(courses)).toBe(4.5)
    })

    it("returns zero for an empty course list", () => {
      expect(calculateIncludedCredits([])).toBe(0)
    })
  })

  describe("calculateIncludedCourseCount", () => {
    it("counts only passed included courses", () => {
      const courses = [
        createTranscriptCourse({
          id: "included-one",
        }),
        createTranscriptCourse({
          id: "included-two",
        }),
        createTranscriptCourse({
          id: "excluded",
          includedInPlan: false,
        }),
        createTranscriptCourse({
          id: "failed",
          completionStatus: "failed",
          includedInPlan: true,
        }),
      ]

      expect(calculateIncludedCourseCount(courses)).toBe(2)
    })

    it("returns zero for an empty course list", () => {
      expect(calculateIncludedCourseCount([])).toBe(0)
    })
  })

  describe("getInvalidIncludedCourses", () => {
    it("returns an included course with a blank title", () => {
      const invalidCourse = createTranscriptCourse({
        id: "blank-title",
        normalizedTitle: "   ",
        credits: 3,
      })

      expect(getInvalidIncludedCourses([invalidCourse])).toEqual([
        invalidCourse,
      ])
    })

    it("returns an included course with zero credits", () => {
      const invalidCourse = createTranscriptCourse({
        id: "zero-credits",
        credits: 0,
      })

      expect(getInvalidIncludedCourses([invalidCourse])).toEqual([
        invalidCourse,
      ])
    })

    it("returns an included course with non-finite credits", () => {
      const invalidCourse = createTranscriptCourse({
        id: "invalid-credits",
        credits: Number.NaN,
      })

      expect(getInvalidIncludedCourses([invalidCourse])).toEqual([
        invalidCourse,
      ])
    })

    it("ignores malformed courses that are excluded", () => {
      const courses = [
        createTranscriptCourse({
          id: "excluded-course",
          normalizedTitle: "",
          credits: 0,
          includedInPlan: false,
        }),
        createTranscriptCourse({
          id: "failed-course",
          normalizedTitle: "",
          credits: 0,
          completionStatus: "failed",
          includedInPlan: true,
        }),
      ]

      expect(getInvalidIncludedCourses(courses)).toEqual([])
    })

    it("returns all invalid included courses", () => {
      const courses = [
        createTranscriptCourse({
          id: "valid-course",
          normalizedTitle: "English Composition I",
          credits: 3,
        }),
        createTranscriptCourse({
          id: "blank-title",
          normalizedTitle: "",
          credits: 3,
        }),
        createTranscriptCourse({
          id: "zero-credits",
          normalizedTitle: "Calculus I",
          credits: 0,
        }),
      ]

      expect(
        getInvalidIncludedCourses(courses).map((course) => course.id),
      ).toEqual(["blank-title", "zero-credits"])
    })
  })
})
