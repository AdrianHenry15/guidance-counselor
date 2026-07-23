import type { AcademicTerm, PlannedSemester } from "@/types/academic.type"
import type { GeneratePlanOptions } from "@/types/planner.type"

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

export function getCreditTarget(
  term: AcademicTerm,
  options: GeneratePlanOptions,
): number {
  return term === "summer"
    ? options.summerCreditTarget
    : options.fallSpringCreditTarget
}

export function formatSemesterLabel(term: AcademicTerm, year: number): string {
  const label = term.charAt(0).toUpperCase() + term.slice(1)

  return `${label} ${year}`
}

export function calculateEstimatedGraduation(
  semesters: PlannedSemester[],
): string | undefined {
  return semesters.at(-1)?.label
}
