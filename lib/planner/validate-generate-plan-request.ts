import type { AcademicTerm, SubjectArea } from "@/types/academic.type"
import type { GeneratePlanOptions, PriorCredential } from "@/types/planner.type"
import type {
  TranscriptCompletionStatus,
  TranscriptCourse,
  TranscriptCourseSource,
} from "@/types/transcript.type"

import { RequestValidationError } from "@/lib/api/request-validation-error"
import { getAcademicProgram } from "@/data/program"
import { sampleAcademicPlan } from "@/data/sample-plan"

/**
 * Validated input returned to the plan-generation route.
 */
interface GeneratePlanRequestValidation {
  transcriptCourses: TranscriptCourse[]
  options: GeneratePlanOptions
}

/**
 * Terms supported by the deterministic semester scheduler.
 */
const validTerms = new Set<AcademicTerm>(["fall", "spring", "summer"])

/**
 * Prior credentials supported by the generalized V1 workflow.
 */
const validPriorCredentials = new Set<PriorCredential>([
  "none",
  "associate",
  "bachelor",
  "other",
])

/**
 * Subject areas supported by transcript courses.
 */
const validSubjectAreas = new Set<SubjectArea>([
  "english",
  "mathematics",
  "science",
  "social_science",
  "humanities",
  "computer_science",
  "foreign_language",
  "fine_arts",
  "health",
  "physical_education",
  "major_core",
  "major_elective",
  "general_elective",
  "college_success",
])

/**
 * Completion states accepted from transcript review.
 */
const validCompletionStatuses = new Set<TranscriptCompletionStatus>([
  "passed",
  "failed",
  "withdrawn",
  "in_progress",
  "unknown",
])

/**
 * Sources supported by normalized transcript courses.
 */
const validCourseSources = new Set<TranscriptCourseSource>([
  "extracted",
  "manual",
])

const currentYear = new Date().getFullYear()
/**
 * Server defaults used when optional planner settings are omitted.
 */
const defaultOptions: GeneratePlanOptions = {
  programId: sampleAcademicPlan.id,
  priorCredential: "none",
  startTerm: "fall",
  startYear: currentYear,
  fallSpringCreditTarget: 12,
  summerCreditTarget: 6,
  includeSummer: true,
}

/**
 * Determines whether a value is a non-null object.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

/**
 * Checks whether a value is an optional string.
 */
function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || typeof value === "string"
}

/**
 * Checks whether a value is a valid transcript course.
 */
function isTranscriptCourse(value: unknown): value is TranscriptCourse {
  if (!isRecord(value)) {
    return false
  }

  const sourceIsValid =
    value.source === undefined ||
    (typeof value.source === "string" &&
      validCourseSources.has(value.source as TranscriptCourseSource))

  const yearIsValid =
    value.year === undefined ||
    (typeof value.year === "number" && Number.isInteger(value.year))

  return (
    typeof value.id === "string" &&
    value.id.trim().length > 0 &&
    typeof value.originalName === "string" &&
    typeof value.normalizedTitle === "string" &&
    typeof value.subjectArea === "string" &&
    validSubjectAreas.has(value.subjectArea as SubjectArea) &&
    typeof value.credits === "number" &&
    Number.isFinite(value.credits) &&
    value.credits >= 0 &&
    typeof value.completionStatus === "string" &&
    validCompletionStatuses.has(
      value.completionStatus as TranscriptCompletionStatus,
    ) &&
    typeof value.includedInPlan === "boolean" &&
    typeof value.confidence === "number" &&
    Number.isFinite(value.confidence) &&
    value.confidence >= 0 &&
    value.confidence <= 1 &&
    isOptionalString(value.grade) &&
    isOptionalString(value.institution) &&
    isOptionalString(value.term) &&
    yearIsValid &&
    sourceIsValid
  )
}

/**
 * Validates transcript-course records and generation eligibility.
 */
function parseTranscriptCourses(value: unknown): TranscriptCourse[] {
  if (!Array.isArray(value)) {
    throw new RequestValidationError(
      "Transcript courses were not provided.",
      400,
    )
  }

  if (!value.every(isTranscriptCourse)) {
    throw new RequestValidationError(
      "One or more transcript courses are invalid.",
    )
  }

  const transcriptCourses = value

  const courseIds = transcriptCourses.map((course) => course.id)

  if (new Set(courseIds).size !== courseIds.length) {
    throw new RequestValidationError("Transcript course IDs must be unique.")
  }

  const includedCourses = transcriptCourses.filter(
    (course) => course.completionStatus === "passed" && course.includedInPlan,
  )

  if (includedCourses.length === 0) {
    throw new RequestValidationError(
      "Include at least one completed course before generating a plan.",
    )
  }

  const courseWithBlankTitle = includedCourses.find(
    (course) => !course.normalizedTitle.trim(),
  )

  if (courseWithBlankTitle) {
    throw new RequestValidationError("Every included course must have a title.")
  }

  const courseWithInvalidCredits = includedCourses.find(
    (course) => course.credits <= 0,
  )

  if (courseWithInvalidCredits) {
    throw new RequestValidationError(
      "Every included course must have a credit value greater than zero.",
    )
  }

  return transcriptCourses
}

/**
 * Validates and normalizes planner options.
 */
function parseOptions(value: unknown): GeneratePlanOptions {
  if (value === undefined) {
    return { ...defaultOptions }
  }

  if (!isRecord(value)) {
    throw new RequestValidationError("Planner options must be an object.", 400)
  }

  const programId = value.programId ?? defaultOptions.programId

  if (typeof programId !== "string" || !getAcademicProgram(programId)) {
    throw new RequestValidationError(
      "The selected academic program is invalid.",
    )
  }

  const priorCredential =
    value.priorCredential ?? defaultOptions.priorCredential

  if (
    typeof priorCredential !== "string" ||
    !validPriorCredentials.has(priorCredential as PriorCredential)
  ) {
    throw new RequestValidationError(
      "The selected prior credential is invalid.",
    )
  }

  const startTerm = value.startTerm ?? defaultOptions.startTerm

  if (
    typeof startTerm !== "string" ||
    !validTerms.has(startTerm as AcademicTerm)
  ) {
    throw new RequestValidationError("The selected starting term is invalid.")
  }

  const startYear = value.startYear ?? defaultOptions.startYear

  const currentYear = new Date().getFullYear()

  if (
    typeof startYear !== "number" ||
    !Number.isInteger(startYear) ||
    startYear < currentYear ||
    startYear > currentYear + 10
  ) {
    throw new RequestValidationError(
      `The selected starting year must be between ${currentYear} and ${currentYear + 10}.`,
    )
  }

  const fallSpringCreditTarget =
    value.fallSpringCreditTarget ?? defaultOptions.fallSpringCreditTarget

  if (
    typeof fallSpringCreditTarget !== "number" ||
    !Number.isFinite(fallSpringCreditTarget) ||
    fallSpringCreditTarget < 1 ||
    fallSpringCreditTarget > 21
  ) {
    throw new RequestValidationError(
      "Fall and spring credits must be between 1 and 21.",
    )
  }

  const includeSummer = value.includeSummer ?? defaultOptions.includeSummer

  if (typeof includeSummer !== "boolean") {
    throw new RequestValidationError("The summer-course preference is invalid.")
  }

  const summerCreditTarget =
    value.summerCreditTarget ?? defaultOptions.summerCreditTarget

  if (
    typeof summerCreditTarget !== "number" ||
    !Number.isFinite(summerCreditTarget) ||
    summerCreditTarget < 1 ||
    summerCreditTarget > 12
  ) {
    throw new RequestValidationError("Summer credits must be between 1 and 12.")
  }

  if (!includeSummer && startTerm === "summer") {
    throw new RequestValidationError(
      "A plan cannot start in summer when summer courses are disabled.",
    )
  }

  return {
    programId,
    priorCredential: priorCredential as PriorCredential,
    startTerm: startTerm as AcademicTerm,
    startYear,
    fallSpringCreditTarget,
    summerCreditTarget,
    includeSummer,
  }
}

/**
 * Validates the complete plan-generation request.
 */
export function validateGeneratePlanRequest(
  value: unknown,
): GeneratePlanRequestValidation {
  if (!isRecord(value)) {
    throw new RequestValidationError(
      "The plan-generation request must be an object.",
      400,
    )
  }

  return {
    transcriptCourses: parseTranscriptCourses(value.transcriptCourses),
    options: parseOptions(value.options),
  }
}
