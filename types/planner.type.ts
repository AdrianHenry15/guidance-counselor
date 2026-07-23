export interface GeneratePlanOptions {
  startTerm: "fall" | "spring" | "summer"
  startYear: number
  fallSpringCreditTarget: number
  summerCreditTarget: number
  includeSummer: boolean
}
