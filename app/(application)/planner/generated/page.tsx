// app/(application)/planner/generated/page.tsx

"use client"

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
} from "lucide-react"
import { useRouter } from "next/navigation"

import { AppShell } from "@/components/layout/app-shell"
import { SemesterCard } from "@/components/planner/semester-card"
import { useAcademicPlan } from "@/components/providers/academic-plan-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function GeneratedPlanPage() {
  const router = useRouter()

  const { generatedPlan, transcriptAnalysis, isHydrated } = useAcademicPlan()

  if (!isHydrated) {
    return (
      <AppShell
        title="Generated Plan"
        description="Your semester-by-semester academic path">
        <Card className="mx-auto max-w-xl p-6">
          <div className="animate-pulse space-y-4">
            <div className="mx-auto size-12 rounded-xl bg-surface-muted" />

            <div className="mx-auto h-6 w-48 rounded bg-surface-muted" />

            <div className="mx-auto h-4 w-72 max-w-full rounded bg-surface-muted" />

            <div className="mx-auto h-11 w-40 rounded-xl bg-surface-muted" />
          </div>
        </Card>
      </AppShell>
    )
  }

  if (!generatedPlan) {
    return (
      <AppShell
        title="Generated Plan"
        description="Your semester-by-semester academic path">
        <Card className="mx-auto max-w-xl p-6 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary-subtle text-primary">
            <GraduationCap className="size-6" />
          </div>

          <h2 className="mt-4 font-display text-xl font-bold text-text-primary">
            No generated plan found
          </h2>

          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Review your transcript and generate an academic plan before opening
            this page.
          </p>

          <Button
            className="mt-5"
            onClick={() =>
              router.push(transcriptAnalysis ? "/transcript/review" : "/upload")
            }>
            {transcriptAnalysis ? "Return to transcript" : "Upload transcript"}
          </Button>
        </Card>
      </AppShell>
    )
  }

  const semesterCount = generatedPlan.semesters.length

  const remainingCredits = generatedPlan.totalPlannedCredits

  const totalProgramCredits =
    generatedPlan.completedCredits + generatedPlan.totalPlannedCredits

  return (
    <AppShell
      title="Generated Plan"
      description="Your generalized path toward graduation">
      <div className="space-y-6">
        <Card className="overflow-hidden border-0 bg-(image:--gradient-hero) p-5 text-brand-on-surface shadow-lg sm:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <Badge className="bg-white/15 text-white">
                <CheckCircle2 className="size-3.5" />
                Plan generated
              </Badge>

              <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-brand-on-surface sm:text-3xl">
                Bachelor&apos;s Degree in Computer Science
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-brand-on-surface-muted">
                This plan accounts for your included transcript courses and
                places remaining generalized requirements according to
                prerequisites.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-136">
              <SummaryMetric
                label="Earned"
                value={`${generatedPlan.completedCredits}`}
                description="credits"
              />

              <SummaryMetric
                label="Remaining"
                value={`${remainingCredits}`}
                description="credits"
              />

              <SummaryMetric
                label="Terms"
                value={`${semesterCount}`}
                description="semesters"
              />

              <SummaryMetric
                label="Estimated"
                value={generatedPlan.estimatedGraduation ?? "Unknown"}
                description="graduation"
              />
            </div>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CalendarDays className="size-5 text-primary" />

                <h2 className="font-display text-lg font-bold text-text-primary">
                  Plan overview
                </h2>
              </div>

              <p className="mt-2 text-sm text-text-secondary">
                {generatedPlan.completedCredits} earned +{" "}
                {generatedPlan.totalPlannedCredits} planned ={" "}
                {totalProgramCredits} mapped credits
              </p>
            </div>

            <Button
              variant="secondary"
              onClick={() => router.push("/transcript/review")}>
              <ArrowLeft className="size-4" />
              Edit transcript
            </Button>
          </div>
        </Card>

        <div className="space-y-5">
          {generatedPlan.semesters.map((semester) => (
            <SemesterCard key={semester.id} semester={semester} />
          ))}
        </div>

        <div className="rounded-2xl border border-info-500/30 p-4 text-sm leading-6 dark:bg-brand-900/20 dark:text-blue-200">
          This plan uses generalized course categories and does not replace your
          institution&apos;s official degree audit. Verify course equivalencies,
          transfer credits, prerequisites, and residency requirements with an
          academic advisor.
        </div>
      </div>
    </AppShell>
  )
}

interface SummaryMetricProps {
  label: string
  value: string
  description: string
}

function SummaryMetric({ label, value, description }: SummaryMetricProps) {
  return (
    <div className="rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-on-surface-muted">
        {label}
      </p>

      <p className="mt-2 font-display text-xl font-bold text-brand-on-surface">
        {value}
      </p>

      <p className="mt-0.5 text-xs text-brand-on-surface-muted">
        {description}
      </p>
    </div>
  )
}
