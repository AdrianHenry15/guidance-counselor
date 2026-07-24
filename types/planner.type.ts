import { AcademicTerm } from "./academic.type"

export interface GeneratePlanOptions {
  programId: string
  startTerm: AcademicTerm
  startYear: number
  fallSpringCreditTarget: number
  summerCreditTarget: number
  includeSummer: boolean
}
