"use client"

import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  FileCheck2,
  GraduationCap,
} from "lucide-react"

import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useAcademicPlan } from "@/components/providers/academic-plan-provider"

/**
 * Displays the user's high-level academic overview.
 *
 * This page currently uses `sampleAcademicPlan` and hardcoded progress values
 * as placeholder content. It can later be connected to the generated academic
 * plan stored in the shared AcademicPlanProvider.
 */
export default function DashboardPage() {
  /**
   * Displays live transcript and generated-plan data from the current session.
   */
  const { transcriptAnalysis, generatedPlan } = useAcademicPlan()

  /**
   * Direct the user to the next relevant step in the planning workflow.
   */
  const primaryAction = generatedPlan
    ? {
        href: "/planner/generated",
        label: "View academic plan",
      }
    : transcriptAnalysis
      ? {
          href: "/transcript/review",
          label: "Review transcript",
        }
      : {
          href: "/upload",
          label: "Upload transcript",
        }

  const earnedCredits =
    generatedPlan?.completedCredits ??
    transcriptAnalysis?.estimatedCreditsEarned ??
    0

  const appliedCredits = generatedPlan?.appliedCredits ?? 0

  const plannedCredits = generatedPlan?.totalPlannedCredits ?? 0

  const totalProgramCredits = generatedPlan
    ? generatedPlan.appliedCredits + generatedPlan.totalPlannedCredits
    : 120

  /**
   * Degree progress uses credits applied to the selected program rather than
   * every earned transcript credit.
   */
  const progressPercentage =
    totalProgramCredits > 0
      ? Math.round((appliedCredits / totalProgramCredits) * 100)
      : 0

  const nextSemester = generatedPlan?.semesters[0]

  const estimatedGraduation = generatedPlan?.estimatedGraduation

  const includedCourseCount =
    transcriptAnalysis?.courses.filter(
      (course) => course.completionStatus === "passed" && course.includedInPlan,
    ).length ?? 0

  return (
    <AppShell
      title="Dashboard"
      description="Review your progress and next academic steps">
      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-6">
          <Card className="overflow-hidden border-0 bg-(image:--gradient-hero) p-6 text-brand-on-surface shadow-lg sm:p-8">
            <div className="max-w-2xl">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-white/15 text-brand-on-surface">
                <GraduationCap className="size-6" />
              </div>

              <h2 className="mt-6 font-display text-2xl font-bold tracking-tight text-brand-on-surface sm:text-3xl">
                {generatedPlan
                  ? "Your academic plan is ready."
                  : transcriptAnalysis
                    ? "Your transcript is ready for review."
                    : "Start building your academic path."}
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-brand-on-surface-muted sm:text-base">
                {generatedPlan
                  ? "Review your semester schedule, validation results, and estimated graduation."
                  : transcriptAnalysis
                    ? "Confirm your detected coursework and choose your scheduling preferences."
                    : "Upload your transcript to identify completed coursework and generate a personalized academic plan."}
              </p>

              <Link href={primaryAction.href} className="mt-6 inline-block">
                <Button variant="on-brand">
                  {primaryAction.label}
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="p-5">
              <FileCheck2 className="size-5 text-text-secondary" />

              <p className="mt-4 text-2xl font-bold text-text-primary">
                {earnedCredits}
              </p>

              <p className="text-sm text-text-secondary">Earned credits</p>
            </Card>

            <Card className="p-5">
              <BookOpen className="size-5 text-text-secondary" />

              <p className="mt-4 text-2xl font-bold text-text-primary">
                {plannedCredits}
              </p>

              <p className="text-sm text-text-secondary">Planned credits</p>
            </Card>

            <Card className="p-5">
              <CalendarDays className="size-5 text-text-secondary" />

              <p className="mt-4 text-lg font-bold text-text-primary">
                {estimatedGraduation}
              </p>

              <p className="text-sm text-text-secondary">
                Estimated graduation
              </p>
            </Card>
          </div>

          <Card className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-bold text-text-primary">Degree progress</h2>

                <p className="mt-1 text-sm text-text-secondary">
                  {generatedPlan
                    ? `${appliedCredits} of ${totalProgramCredits} credits applied`
                    : "Generate a plan to calculate degree progress"}
                </p>
              </div>

              <p className="text-xl font-bold text-text-primary">
                {progressPercentage}%
              </p>
            </div>

            <div className="mt-5">
              <Progress value={appliedCredits} max={totalProgramCredits} />
            </div>

            {generatedPlan ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Progress
                  label="Applied credits"
                  value={appliedCredits}
                  max={totalProgramCredits}
                />

                <Progress
                  label="Remaining credits"
                  value={plannedCredits}
                  max={totalProgramCredits}
                />
              </div>
            ) : null}
          </Card>
        </div>

        <div className="space-y-6">
          {nextSemester ? (
            <Card className="p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                Next semester
              </p>

              <h2 className="mt-2 font-display text-xl font-bold text-text-primary">
                {nextSemester.label}
              </h2>

              <div className="mt-5 space-y-3">
                {nextSemester.courses.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between gap-3 rounded-xl bg-surface-muted p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-text-primary">
                        {course.title}
                      </p>

                      <p className="text-xs capitalize text-text-tertiary">
                        {course.subjectArea.replaceAll("_", " ")}
                      </p>
                    </div>

                    <p className="shrink-0 text-xs font-medium text-text-secondary">
                      {course.credits} cr.
                    </p>
                  </div>
                ))}
              </div>

              <Link href="/planner/generated" className="mt-5 block">
                <Button variant="secondary" className="w-full">
                  Review semester
                </Button>
              </Link>
            </Card>
          ) : (
            <Card className="p-5 sm:p-6">
              <CalendarDays className="size-5 text-text-secondary" />

              <h2 className="mt-3 font-bold text-text-primary">
                No semester plan yet
              </h2>

              <p className="mt-2 text-sm leading-6 text-text-secondary">
                {transcriptAnalysis
                  ? "Review your transcript and generate a plan to see your next semester."
                  : "Upload your transcript to begin building your academic schedule."}
              </p>

              <Link href={primaryAction.href} className="mt-5 block">
                <Button variant="secondary" className="w-full">
                  {primaryAction.label}
                </Button>
              </Link>
            </Card>
          )}

          <Card className="p-5 sm:p-6">
            <h2 className="font-bold text-text-primary">Transcript status</h2>

            <p className="mt-2 text-sm leading-6 text-text-secondary">
              {transcriptAnalysis
                ? `${transcriptAnalysis.courses.length} courses detected with ${includedCourseCount} currently included.`
                : "No transcript has been uploaded during this session."}
            </p>

            <Link
              href={transcriptAnalysis ? "/transcript/review" : "/upload"}
              className="mt-5 block">
              <Button className="w-full">
                {transcriptAnalysis ? "Review transcript" : "Upload transcript"}
              </Button>
            </Link>
          </Card>

          {generatedPlan ? (
            <Card className="p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <CheckCircle2
                  className={
                    generatedPlan.validation.isValid
                      ? "mt-0.5 size-5 shrink-0 text-success-600"
                      : "mt-0.5 size-5 shrink-0 text-danger"
                  }
                />

                <div>
                  <h2 className="font-bold text-text-primary">
                    Plan validation
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-text-secondary">
                    {generatedPlan.validation.isValid
                      ? generatedPlan.validation.warningCount
                        ? `${generatedPlan.validation.warningCount} warnings require review.`
                        : "All plan checks passed."
                      : `${generatedPlan.validation.errorCount} errors and ${generatedPlan.validation.warningCount} warnings detected.`}
                  </p>
                </div>
              </div>

              <Link href="/planner/generated" className="mt-5 block">
                <Button variant="secondary" className="w-full">
                  View validation details
                </Button>
              </Link>
            </Card>
          ) : null}
        </div>
      </div>
    </AppShell>
  )
}
