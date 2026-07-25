import { describe, expect, it } from "vitest"

import { computerScienceBachelorProgram } from "@/data/degree.data"
import { validateGeneratePlanRequest } from "@/lib/planner/validate-generate-plan-request"
import { createTranscriptCourse } from "@/tests/factories/transcript-course.factory"

const validStartYear = new Date().getFullYear() + 1

/**
 * Creates a valid planner request that individual tests can override.
 */
function createValidRequest() {
  return {
    transcriptCourses: [createTranscriptCourse()],
    options: {
      programId: computerScienceBachelorProgram.id,
      priorCredential: "none",
      startTerm: "fall",
      startYear: validStartYear,
      fallSpringCreditTarget: 12,
      summerCreditTarget: 6,
      includeSummer: true,
    },
  }
}

describe("validateGeneratePlanRequest", () => {
  it("accepts a valid request", () => {
    const result = validateGeneratePlanRequest(createValidRequest())

    expect(result.transcriptCourses).toHaveLength(1)

    expect(result.options).toEqual(
      expect.objectContaining({
        programId: computerScienceBachelorProgram.id,
        priorCredential: "none",
        startTerm: "fall",
        startYear: validStartYear,
        fallSpringCreditTarget: 12,
        summerCreditTarget: 6,
        includeSummer: true,
      }),
    )
  })

  it("accepts a valid prior credential", () => {
    const request = createValidRequest()

    request.options.priorCredential = "associate"

    const result = validateGeneratePlanRequest(request)

    expect(result.options.priorCredential).toBe("associate")
  })

  it("rejects an unsupported prior credential", () => {
    const request = createValidRequest()

    const invalidRequest = {
      ...request,
      options: {
        ...request.options,
        priorCredential: "doctorate",
      },
    }

    expect(() => validateGeneratePlanRequest(invalidRequest)).toThrow(
      "The selected prior credential is invalid.",
    )
  })

  it("rejects a missing transcript course list", () => {
    expect(() =>
      validateGeneratePlanRequest({
        options: createValidRequest().options,
      }),
    ).toThrow("Transcript courses were not provided.")
  })

  it("rejects an empty transcript course list", () => {
    expect(() =>
      validateGeneratePlanRequest({
        ...createValidRequest(),
        transcriptCourses: [],
      }),
    ).toThrow("Include at least one completed course before generating a plan.")
  })

  it("rejects a request with no passed included courses", () => {
    const request = createValidRequest()

    request.transcriptCourses = [
      createTranscriptCourse({
        completionStatus: "failed",
      }),
      createTranscriptCourse({
        id: "excluded-course",
        includedInPlan: false,
      }),
    ]

    expect(() => validateGeneratePlanRequest(request)).toThrow(
      "Include at least one completed course before generating a plan.",
    )
  })

  it("rejects an included course with a blank title", () => {
    const request = createValidRequest()

    request.transcriptCourses = [
      createTranscriptCourse({
        title: "   ",
      }),
    ]

    expect(() => validateGeneratePlanRequest(request)).toThrow(
      "Every included course must have a title.",
    )
  })

  it("rejects an included course with zero credits", () => {
    const request = createValidRequest()

    request.transcriptCourses = [
      createTranscriptCourse({
        credits: 0,
      }),
    ]

    expect(() => validateGeneratePlanRequest(request)).toThrow(
      "Every included course must have a credit value greater than zero.",
    )
  })

  it("rejects an invalid academic program", () => {
    const request = createValidRequest()

    request.options.programId = "missing-program"

    expect(() => validateGeneratePlanRequest(request)).toThrow(
      "The selected academic program is invalid.",
    )
  })

  it("rejects an invalid start term", () => {
    const request = createValidRequest()

    const invalidRequest = {
      ...request,
      options: {
        ...request.options,
        startTerm: "winter",
      },
    }

    expect(() => validateGeneratePlanRequest(invalidRequest)).toThrow(
      "The selected starting term is invalid.",
    )
  })

  it("rejects summer as the start term when summer is disabled", () => {
    const request = createValidRequest()

    request.options.startTerm = "summer"
    request.options.includeSummer = false

    expect(() => validateGeneratePlanRequest(request)).toThrow(
      "A plan cannot start in summer when summer courses are disabled.",
    )
  })

  it("rejects an invalid fall and spring credit target", () => {
    const request = createValidRequest()

    request.options.fallSpringCreditTarget = 22

    expect(() => validateGeneratePlanRequest(request)).toThrow(
      "Fall and spring credits must be between 1 and 21.",
    )
  })

  it("rejects an invalid summer credit target", () => {
    const request = createValidRequest()

    request.options.summerCreditTarget = 13

    expect(() => validateGeneratePlanRequest(request)).toThrow(
      "Summer credits must be between 1 and 12.",
    )
  })
})
