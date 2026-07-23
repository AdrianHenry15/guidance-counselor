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
import { PlanValidationSummary } from "@/components/planner/plan-validation-summary"

/**
 * Displays the personalized academic plan generated from the user's reviewed
 * transcript and selected scheduling preferences.
 *
 * The plan is read from shared in-memory context, so this page depends on the
 * user completing the upload and review workflow during the current session.
 */
export default function GeneratedPlanPage() {
  const router = useRouter()

  /**
   * `generatedPlan` contains the completed semester-by-semester schedule.
   *
   * `transcriptAnalysis` is used only to determine where the user should be
   * redirected when no generated plan is currently available.
   */
  const { generatedPlan, transcriptAnalysis } = useAcademicPlan()

  /**
   * Show a recovery state when the user opens this route without generating
   * a plan first, or after refreshing and clearing the in-memory provider.
   */
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

          {/*
           * Return to transcript review when an analysis still exists.
           * Otherwise, restart the workflow from the upload page.
           */}
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

  /**
   * Derived metrics used by the hero summary and plan overview.
   */
  const semesterCount = generatedPlan.semesters.length

  const remainingCredits = generatedPlan.totalPlannedCredits

  /**
   * Mapped credits represent transcript credits applied to this degree plus
   * the remaining credits scheduled by the planner.
   *
   * This intentionally uses `appliedCredits` instead of `completedCredits`
   * because not every earned transcript credit is guaranteed to satisfy the
   * selected program.
   */
  const totalProgramCredits =
    generatedPlan.appliedCredits + generatedPlan.totalPlannedCredits

  return (
    <AppShell
      title="Generated Plan"
      description="Your generalized path toward graduation">
      <div className="space-y-6">
        {/*
         * Primary summary for the generated degree plan.
         *
         * It presents the degree, earned credits, remaining credits, term
         * count, and estimated graduation in a compact overview.
         */}
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

        {/*
         * Explains how the degree-credit total is composed and provides a path
         * back to transcript review for corrections.
         */}
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

        {/*
         * Shows deterministic validation results for prerequisite order,
         * duplicate courses, credit overloads, and mapped-credit integrity.
         */}
        <PlanValidationSummary validation={generatedPlan.validation} />

        {/*
         * Render the generated semesters in chronological order.
         */}
        <div className="space-y-5">
          {generatedPlan.semesters.map((semester) => (
            <SemesterCard key={semester.id} semester={semester} />
          ))}
        </div>

        {/*
         * Clarifies that this generated plan is advisory and should be checked
         * against the student's institution before registration.
         */}
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

/**
 * Props for a single summary metric shown in the generated-plan hero.
 */
interface SummaryMetricProps {
  label: string
  value: string
  description: string
}

/**
 * Renders one compact plan metric with a label, primary value, and unit.
 */
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
