import type { AcademicTerm } from "@/types/academic.type"
import type { GeneratePlanOptions } from "@/types/planner.type"
import type { TranscriptCourse } from "@/types/transcript.type"
import { RequestValidationError } from "../api/request-validation-error"

interface GeneratePlanRequestBody {
  transcriptCourses?: unknown
  options?: unknown
}

interface GeneratePlanRequestValidation {
  transcriptCourses: TranscriptCourse[]
  options: GeneratePlanOptions
}

const validTerms = new Set<AcademicTerm>(["fall", "spring", "summer"])

const defaultOptions: GeneratePlanOptions = {
  programId: "bachelor-computer-science",
  startTerm: "fall",
  startYear: 2027,
  fallSpringCreditTarget: 12,
  summerCreditTarget: 6,
  includeSummer: true,
}

/**
 * Checks whether a value is a valid transcript course object.
 */
function isTranscriptCourse(value: unknown): value is TranscriptCourse {
  if (typeof value !== "object" || value === null) {
    return false
  }

  const course = value as Partial<TranscriptCourse>

  return (
    typeof course.id === "string" &&
    typeof course.originalName === "string" &&
    typeof course.normalizedTitle === "string" &&
    typeof course.subjectArea === "string" &&
    typeof course.credits === "number" &&
    Number.isFinite(course.credits) &&
    course.credits >= 0 &&
    typeof course.completionStatus === "string" &&
    typeof course.includedInPlan === "boolean" &&
    typeof course.confidence === "number"
  )
}

/**
 * Validates and normalizes planner options.
 */
function parseOptions(value: unknown): GeneratePlanOptions {
  if (typeof value !== "object" || value === null) {
    return defaultOptions
  }

  const submitted = value as Partial<GeneratePlanOptions>

  const options: GeneratePlanOptions = {
    ...defaultOptions,
    ...submitted,
  }

  if (!validTerms.has(options.startTerm)) {
    throw new RequestValidationError("The selected starting term is invalid.")
  }

  const currentYear = new Date().getFullYear()

  if (
    !Number.isInteger(options.startYear) ||
    options.startYear < currentYear ||
    options.startYear > currentYear + 10
  ) {
    throw new Error("The selected starting year is invalid.")
  }

  if (
    !Number.isFinite(options.fallSpringCreditTarget) ||
    options.fallSpringCreditTarget < 1 ||
    options.fallSpringCreditTarget > 21
  ) {
    throw new Error("Fall and spring credits must be between 1 and 21.")
  }

  if (typeof options.includeSummer !== "boolean") {
    throw new Error("The summer-course preference is invalid.")
  }

  if (
    !Number.isFinite(options.summerCreditTarget) ||
    options.summerCreditTarget < 1 ||
    options.summerCreditTarget > 12
  ) {
    throw new Error("Summer credits must be between 1 and 12.")
  }

  if (!options.includeSummer && options.startTerm === "summer") {
    throw new Error(
      "A plan cannot start in summer when summer courses are disabled.",
    )
  }

  return options
}

/**
 * Validates the complete plan-generation request.
 */
export function validateGeneratePlanRequest(
  body: GeneratePlanRequestBody,
): GeneratePlanRequestValidation {
  if (!Array.isArray(body.transcriptCourses)) {
    throw new RequestValidationError(
      "Transcript courses were not provided.",
      400,
    )
  }

  if (!body.transcriptCourses.every(isTranscriptCourse)) {
    throw new Error("One or more transcript courses are invalid.")
  }

  const transcriptCourses = body.transcriptCourses

  const includedCourses = transcriptCourses.filter(
    (course) => course.completionStatus === "passed" && course.includedInPlan,
  )

  if (!includedCourses.length) {
    throw new Error(
      "Include at least one completed course before generating a plan.",
    )
  }

  const invalidIncludedCourse = includedCourses.some(
    (course) => !course.normalizedTitle.trim() || course.credits <= 0,
  )

  if (invalidIncludedCourse) {
    throw new Error(
      "Every included course must have a title and a credit value greater than zero.",
    )
  }

  return {
    transcriptCourses,
    options: parseOptions(body.options),
  }
}
