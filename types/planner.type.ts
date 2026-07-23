import { AcademicTerm } from "./academic.type"

export interface GeneratePlanOptions {
  startTerm: AcademicTerm
  startYear: number
  fallSpringCreditTarget: number
  summerCreditTarget: number
  includeSummer: boolean
}
