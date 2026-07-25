import { computerScienceBachelorProgram } from "@/data/degree.data"
import type { GeneratePlanOptions } from "@/types/planner.type"

/**
 * Creates predictable scheduling preferences for planner tests.
 */
export function createPlanOptions(
  overrides: Partial<GeneratePlanOptions> = {},
): GeneratePlanOptions {
  return {
    programId: computerScienceBachelorProgram.id,
    priorCredential: "none",
    startTerm: "fall",
    startYear: new Date().getFullYear() + 1,
    fallSpringCreditTarget: 12,
    summerCreditTarget: 6,
    includeSummer: true,
    ...overrides,
  }
}
