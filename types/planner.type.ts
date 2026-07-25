import { AcademicTerm } from "./academic.type"

/**
 * Credential already earned before beginning the selected program.
 */
export type PriorCredential = "none" | "associate" | "bachelor" | "other"

/**
 * User preferences controlling deterministic semester scheduling.
 */
export interface GeneratePlanOptions {
  programId: string
  priorCredential: PriorCredential
  startTerm: AcademicTerm
  startYear: number
  fallSpringCreditTarget: number
  summerCreditTarget: number
  includeSummer: boolean
}
