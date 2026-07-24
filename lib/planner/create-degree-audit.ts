import type { AcademicProgram } from "@/types/degree.type"
import type {
  DegreeAudit,
  DegreeRequirementProgress,
  DegreeRequirementProgressStatus,
} from "@/types/degree-audit.type"

interface CreateDegreeAuditArguments {
  program: AcademicProgram
  appliedCreditsByRequirementId: Record<string, number>
}

/**
 * Determines the current state of one requirement.
 */
function getRequirementStatus(
  appliedCredits: number,
  requiredCredits: number,
): DegreeRequirementProgressStatus {
  if (appliedCredits >= requiredCredits) {
    return "complete"
  }

  if (appliedCredits > 0) {
    return "in_progress"
  }

  return "not_started"
}

/**
 * Builds requirement-level degree progress from transcript allocations.
 */
export function createDegreeAudit({
  program,
  appliedCreditsByRequirementId,
}: CreateDegreeAuditArguments): DegreeAudit {
  const requirements: DegreeRequirementProgress[] = program.requirements.map(
    (requirement) => {
      const appliedCredits = Math.min(
        appliedCreditsByRequirementId[requirement.id] ?? 0,
        requirement.requiredCredits,
      )

      const remainingCredits = Math.max(
        requirement.requiredCredits - appliedCredits,
        0,
      )

      const completionPercentage =
        requirement.requiredCredits > 0
          ? Math.round((appliedCredits / requirement.requiredCredits) * 100)
          : 100

      return {
        requirementId: requirement.id,
        title: requirement.title,
        description: requirement.description,
        requiredCredits: requirement.requiredCredits,
        appliedCredits,
        remainingCredits,
        completionPercentage,
        status: getRequirementStatus(
          appliedCredits,
          requirement.requiredCredits,
        ),
      }
    },
  )

  const totalAppliedCredits = requirements.reduce(
    (total, requirement) => total + requirement.appliedCredits,
    0,
  )

  const totalRemainingCredits = Math.max(
    program.totalCredits - totalAppliedCredits,
    0,
  )

  const completionPercentage =
    program.totalCredits > 0
      ? Math.round((totalAppliedCredits / program.totalCredits) * 100)
      : 100

  return {
    programId: program.id,
    programName: program.name,
    totalRequiredCredits: program.totalCredits,
    totalAppliedCredits,
    totalRemainingCredits,
    completionPercentage,
    requirements,
  }
}
