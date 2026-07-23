import { AlertTriangle, Sparkles } from "lucide-react"

import { AppShell } from "@/components/layout/app-shell"
import { SemesterCard } from "@/components/planner/semester-card"
import { Card } from "@/components/ui/card"
import { sampleAcademicPlan } from "@/data/sample-plan"

export default function PlannerPage() {
  return (
    <AppShell
      title="Academic Plan"
      description="Your generalized path toward graduation">
      <div className="space-y-6">
        <Card className="p-5 sm:p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-600">
                <Sparkles className="size-4" />
                Recommended plan
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                Bachelor&apos;s Degree in Computer Science
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                This schedule uses generalized course categories. Your
                institution may use different names, numbers, credit values, or
                prerequisite rules.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:min-w-72">
              <div className="rounded-xl bg-slate-100 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Planned
                </p>
                <p className="mt-1 text-xl font-bold text-slate-950">
                  {sampleAcademicPlan.totalPlannedCredits}
                </p>
                <p className="text-xs text-slate-500">credits</p>
              </div>

              <div className="rounded-xl bg-slate-100 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Estimated
                </p>
                <p className="mt-1 text-base font-bold text-slate-950">
                  {sampleAcademicPlan.estimatedGraduation}
                </p>
                <p className="text-xs text-slate-500">graduation</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
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
