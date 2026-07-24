import { CircleAlert, CircleCheck } from "lucide-react"

import { Card } from "@/components/ui/card"
import type { TranscriptCreditAllocation } from "@/types/credit-allocation.type"

interface CreditAllocationSummaryProps {
  allocations: TranscriptCreditAllocation[]
}

/**
 * Shows how transcript credits were applied to the selected program.
 */
export function CreditAllocationSummary({
  allocations,
}: CreditAllocationSummaryProps) {
  if (!allocations.length) {
    return null
  }

  return (
    <Card className="p-5 sm:p-6">
      <div>
        <h2 className="font-display text-lg font-bold text-text-primary">
          Transcript credit allocation
        </h2>

        <p className="mt-1 text-sm text-text-secondary">
          Review how your completed courses were applied to this degree.
        </p>
      </div>

      <div className="mt-5 space-y-3">
        {allocations.map((allocation) => {
          const fullyApplied = allocation.unappliedCredits === 0

          return (
            <div
              key={allocation.transcriptCourseId}
              className="flex items-start gap-3 rounded-xl border border-border bg-surface-muted p-4">
              {fullyApplied ? (
                <CircleCheck className="mt-0.5 size-5 shrink-0 text-success-600" />
              ) : (
                <CircleAlert className="mt-0.5 size-5 shrink-0 text-warning-600" />
              )}

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-text-primary">
                  {allocation.transcriptCourseTitle}
                </p>

                <p className="mt-1 text-sm text-text-secondary">
                  {allocation.appliedCredits} of {allocation.earnedCredits}{" "}
                  credits applied
                  {allocation.requirementCourseTitle
                    ? ` to ${allocation.requirementCourseTitle}`
                    : ""}
                </p>

                {allocation.unappliedCredits > 0 ? (
                  <p className="mt-1 text-xs font-medium text-warning-700 dark:text-amber-300">
                    {allocation.unappliedCredits} credits were not applied
                  </p>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
