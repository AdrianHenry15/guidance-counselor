import type { Metadata } from "next"
import { AlertTriangle, Sparkles } from "lucide-react"

import { AppShell } from "@/components/layout/app-shell"
import { SemesterCard } from "@/components/planner/semester-card"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { sampleAcademicPlan } from "@/data/sample-plan"

export const metadata: Metadata = {
  title: "Academic Plan",
  description: "Review your generalized semester-by-semester academic plan.",
}

export default function PlannerPage() {
  return (
    <AppShell
      title="Academic Plan"
      description="Your generalized path toward graduation">
      <div className="space-y-6">
        <Card className="overflow-hidden border-0 bg-(image:--gradient-hero) p-5 text-brand-on-surface shadow-lg sm:p-7">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <Badge className="bg-white/15 text-white">
                <Sparkles className="size-3.5" />
                Recommended plan
              </Badge>

              <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-brand-on-surface sm:text-3xl">
                Bachelor&apos;s Degree in Computer Science
              </h2>

              <p className="mt-3 text-sm leading-6 text-brand-on-surface-muted">
                This schedule uses generalized course categories. Your
                institution may use different names, credit values, or
                prerequisite requirements.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:min-w-72">
              <div className="rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-on-surface-muted">
                  Planned
                </p>

                <p className="mt-2 font-display text-2xl font-bold tabular-nums text-brand-on-surface">
                  {sampleAcademicPlan.totalPlannedCredits}
                </p>

                <p className="text-xs text-brand-on-surface-muted">credits</p>
              </div>

              <div className="rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-on-surface-muted">
                  Estimated
                </p>

                <p className="mt-2 font-display text-base font-bold text-brand-on-surface">
                  {sampleAcademicPlan.estimatedGraduation}
                </p>

                <p className="text-xs text-brand-on-surface-muted">
                  graduation
                </p>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex items-start gap-3 rounded-2xl border border-warning-500/30 p-4 dark:bg-warning-700/15 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 size-5 shrink-0" />

          <p className="text-sm leading-6">
            Verify this plan with your institution or academic advisor before
            registering. Guidance Counselor provides planning assistance, not an
            official degree audit.
          </p>
        </div>

        <div className="space-y-5">
          {sampleAcademicPlan.semesters.map((semester) => (
            <SemesterCard key={semester.id} semester={semester} />
          ))}
        </div>
      </div>
    </AppShell>
  )
}
