import { AlertTriangle, CheckCircle2, CircleX } from "lucide-react"

import { Card } from "@/components/ui/card"
import type {
  PlanValidationIssue,
  PlanValidationResult,
} from "@/types/plan-validation.type"

/**
 * Validation data displayed for a generated plan.
 */
interface PlanValidationSummaryProps {
  validation: PlanValidationResult
}

/**
 * Displays one validation error or warning.
 */
function ValidationIssueRow({ issue }: { issue: PlanValidationIssue }) {
  const isError = issue.severity === "error"

  const Icon = isError ? CircleX : AlertTriangle

  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-surface-muted p-4">
      <Icon
        className={
          isError
            ? "mt-0.5 size-5 shrink-0 text-danger-600"
            : "mt-0.5 size-5 shrink-0 text-warning-600"
        }
      />

      <div>
        <p className="text-sm font-semibold text-text-primary">
          {issue.type
            .replaceAll("_", " ")
            .replace(/\b\w/g, (character) => character.toUpperCase())}
        </p>

        <p className="mt-1 text-sm leading-6 text-text-secondary">
          {issue.message}
        </p>
      </div>
    </div>
  )
}

/**
 * Displays the overall plan-validation result and any detected issues.
 */
export function PlanValidationSummary({
  validation,
}: PlanValidationSummaryProps) {
  if (validation.isValid && validation.warningCount === 0) {
    return (
      <Card className="border-success-500/30 bg-success-50 p-5 dark:bg-success-700/10">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success-600" />

          <div>
            <h2 className="font-display text-lg font-bold text-text-primary">
              Plan checks passed
            </h2>

            <p className="mt-1 text-sm leading-6 text-text-secondary">
              No prerequisite, duplicate-course, credit-load, or degree-credit
              issues were detected.
            </p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-5 sm:p-6">
      <div>
        <h2 className="font-display text-lg font-bold text-text-primary">
          Plan validation
        </h2>

        <p className="mt-1 text-sm text-text-secondary">
          {validation.errorCount} errors · {validation.warningCount} warnings
        </p>
      </div>

      <div className="mt-5 space-y-3">
        {validation.issues.map((issue) => (
          <ValidationIssueRow key={issue.id} issue={issue} />
        ))}
      </div>
    </Card>
  )
}
