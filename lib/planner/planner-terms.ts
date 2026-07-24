import type { AcademicTerm, PlannedSemester } from "@/types/academic.type"
import type { GeneratePlanOptions } from "@/types/planner.type"

/**
 * Returns the next academic term and year.
 */
export function getNextTerm(
  term: AcademicTerm,
  year: number,
  includeSummer: boolean,
): {
  term: AcademicTerm
  year: number
} {
  if (term === "fall") {
    return {
      term: "spring",
      year: year + 1,
    }
  }

  if (term === "spring") {
    return includeSummer
      ? {
          term: "summer",
          year,
        }
      : {
          term: "fall",
          year,
        }
  }

  return {
    term: "fall",
    year,
  }
}

/**
 * Returns the credit target for the selected term.
 */
export function getCreditTarget(
  term: AcademicTerm,
  options: GeneratePlanOptions,
): number {
  return term === "summer"
    ? options.summerCreditTarget
    : options.fallSpringCreditTarget
}

/**
 * Formats a term and year into a semester label.
 */
export function formatSemesterLabel(term: AcademicTerm, year: number): string {
  const label = term.charAt(0).toUpperCase() + term.slice(1)

  return `${label} ${year}`
}

/**
 * Uses the final scheduled semester as the graduation estimate.
 */
export function calculateEstimatedGraduation(
  semesters: PlannedSemester[],
): string | undefined {
  return semesters.at(-1)?.label
}
