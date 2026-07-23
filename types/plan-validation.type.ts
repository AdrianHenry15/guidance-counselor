export type PlanValidationIssueType =
  | "missing_prerequisite"
  | "duplicate_course"
  | "credit_overload"
  | "credit_mismatch"

export type PlanValidationSeverity = "warning" | "error"

export interface PlanValidationIssue {
  id: string
  type: PlanValidationIssueType
  severity: PlanValidationSeverity
  message: string
  semesterId?: string
  courseId?: string
}

export interface PlanValidationResult {
  isValid: boolean
  issues: PlanValidationIssue[]
  errorCount: number
  warningCount: number
}
