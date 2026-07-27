import { CheckCircle2, Circle, CircleDot } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type {
  DegreeAudit,
  DegreeRequirementProgress,
} from "@/types/degree-audit.type"

interface DegreeAuditSummaryProps {
  audit: DegreeAudit
}

/**
 * Displays the progress state for one degree requirement.
 */
function RequirementProgressRow({
  requirement,
}: {
  requirement: DegreeRequirementProgress
}) {
  const Icon =
    requirement.status === "complete"
      ? CheckCircle2
      : requirement.status === "in_progress"
        ? CircleDot
        : Circle

  return (
    <div className="rounded-xl border border-border bg-surface-muted p-4">
      <div className="flex items-start gap-3">
        <Icon
          className={
            requirement.status === "complete"
              ? "mt-0.5 size-5 shrink-0 text-success-text"
              : requirement.status === "in_progress"
                ? "mt-0.5 size-5 shrink-0 text-primary"
                : "mt-0.5 size-5 shrink-0 text-text-tertiary"
          }
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold text-text-primary">
              {requirement.title}
            </p>

            <p className="text-sm font-medium text-text-secondary">
              {requirement.appliedCredits} / {requirement.requiredCredits}{" "}
              credits
            </p>
          </div>

          <p className="mt-1 text-sm leading-6 text-text-secondary">
            {requirement.description}
          </p>

          <div className="mt-3">
            <Progress
              value={requirement.appliedCredits}
              max={requirement.requiredCredits}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Displays requirement-level progress for the selected degree.
 */
export function DegreeAuditSummary({ audit }: DegreeAuditSummaryProps) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-text-primary">
            Degree audit
          </h2>

          <p className="mt-1 text-sm text-text-secondary">
            {audit.totalAppliedCredits} of {audit.totalRequiredCredits} required
            credits applied
          </p>
        </div>

        <p className="font-display text-2xl font-bold text-text-primary">
          {audit.completionPercentage}%
        </p>
      </div>

      <div className="mt-5">
        <Progress
          value={audit.totalAppliedCredits}
          max={audit.totalRequiredCredits}
        />
      </div>

      <div className="mt-6 space-y-3">
        {audit.requirements.map((requirement) => (
          <RequirementProgressRow
            key={requirement.requirementId}
            requirement={requirement}
          />
        ))}
      </div>
    </Card>
  )
}
