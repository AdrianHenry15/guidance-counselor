/**
 * Completion state for one degree requirement.
 */
export type DegreeRequirementProgressStatus =
  | "complete"
  | "in_progress"
  | "not_started"

/**
 * Credit progress for one degree requirement.
 */
export interface DegreeRequirementProgress {
  requirementId: string
  title: string
  description: string
  requiredCredits: number
  appliedCredits: number
  remainingCredits: number
  completionPercentage: number
  status: DegreeRequirementProgressStatus
}

/**
 * Requirement-level summary for the selected academic program.
 */
export interface DegreeAudit {
  programId: string
  programName: string
  totalRequiredCredits: number
  totalAppliedCredits: number
  totalRemainingCredits: number
  completionPercentage: number
  requirements: DegreeRequirementProgress[]
}
