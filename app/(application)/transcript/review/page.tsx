"use client"

import { Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

import { AppShell } from "@/components/layout/app-shell"
import { useAcademicPlan } from "@/components/providers/academic-plan-provider"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { subjectOptions } from "@/data/subject-options"
import type { SubjectArea } from "@/types/academic.type"
import type { TranscriptCourse } from "@/types/transcript.type"

function calculateCompletedCredits(courses: TranscriptCourse[]): number {
  return courses.reduce((total, course) => {
    if (!course.completed) {
      return total
    }

    return total + course.credits
  }, 0)
}

export default function TranscriptReviewPage() {
  const router = useRouter()

  const { transcriptAnalysis, updateTranscriptAnalysis } = useAcademicPlan()

  if (!transcriptAnalysis) {
    return (
      <AppShell
        title="Transcript Review"
        description="Review detected coursework">
        <Card className="mx-auto max-w-xl p-6 text-center">
          <h2 className="font-display text-xl font-bold text-text-primary">
            No transcript analysis found
          </h2>

          <p className="mt-2 text-sm text-text-secondary">
            Upload a transcript before reviewing coursework.
          </p>

          <Button className="mt-5" onClick={() => router.push("/upload")}>
            Upload transcript
          </Button>
        </Card>
      </AppShell>
    )
  }

  const analysis = transcriptAnalysis

  function updateCourse(courseId: string, updates: Partial<TranscriptCourse>) {
    const updatedCourses = analysis.courses.map((course) => {
      if (course.id !== courseId) {
        return course
      }

      return {
        ...course,
        ...updates,
      }
    })

    updateTranscriptAnalysis({
      ...analysis,
      courses: updatedCourses,
      estimatedCreditsEarned: calculateCompletedCredits(updatedCourses),
    })
  }

  function removeCourse(courseId: string) {
    const updatedCourses = analysis.courses.filter(
      (course) => course.id !== courseId,
    )

    updateTranscriptAnalysis({
      ...analysis,
      courses: updatedCourses,
      estimatedCreditsEarned: calculateCompletedCredits(updatedCourses),
    })
  }

  function handleGeneratePlan() {
    const completedCourses = analysis.courses.filter(
      (course) => course.completed,
    )

    if (!completedCourses.length) {
      return
    }

    router.push("/planner/generated")
  }

  const completedCourseCount = analysis.courses.filter(
    (course) => course.completed,
  ).length

  return (
    <AppShell
      title="Transcript Review"
      description="Confirm your completed coursework">
      <div className="space-y-6">
        <Card className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-text-primary">
                {analysis.fileName}
              </h2>

              <p className="mt-1 text-sm text-text-secondary">
                {analysis.courses.length} courses detected ·{" "}
                {completedCourseCount} included ·{" "}
                {analysis.estimatedCreditsEarned} credits earned
              </p>
            </div>

            <Button
              onClick={handleGeneratePlan}
              disabled={!completedCourseCount}>
              Generate academic plan
            </Button>
          </div>
        </Card>

        {analysis.warnings.length > 0 ? (
          <div className="space-y-3">
            {analysis.warnings.map((warning) => (
              <div
                key={warning}
                className="rounded-xl border border-warning-500/30 p-4 text-sm leading-6 dark:bg-warning-700/15 dark:text-amber-200">
                {warning}
              </div>
            ))}
          </div>
        ) : null}

        <div className="space-y-4">
          {analysis.courses.map((course) => (
            <Card key={course.id} className="p-4 sm:p-5">
              <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr_120px_110px_auto] lg:items-end">
                <label className="grid gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                    Course
                  </span>

                  <input
                    value={course.normalizedTitle}
                    onChange={(event) =>
                      updateCourse(course.id, {
                        normalizedTitle: event.target.value,
                      })
                    }
                    className="min-h-11 rounded-xl border bg-surface px-3 text-sm text-text-primary outline-none transition focus:border-primary focus:ring-4 focus:ring-brand-100"
                  />
                </label>

                <label className="grid gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                    Subject
                  </span>

                  <select
                    value={course.subjectArea}
                    onChange={(event) =>
                      updateCourse(course.id, {
                        subjectArea: event.target.value as SubjectArea,
                      })
                    }
                    className="min-h-11 rounded-xl border bg-surface px-3 text-sm text-text-primary outline-none transition focus:border-primary focus:ring-4 focus:ring-brand-100">
                    {subjectOptions.map((subject) => (
                      <option key={subject.value} value={subject.value}>
                        {subject.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                    Credits
                  </span>

                  <input
                    type="number"
                    min={0}
                    max={12}
                    step={0.5}
                    value={course.credits}
                    onChange={(event) => {
                      const credits = Number(event.target.value)

                      updateCourse(course.id, {
                        credits: Number.isFinite(credits) ? credits : 0,
                      })
                    }}
                    className="min-h-11 rounded-xl border bg-surface px-3 text-sm text-text-primary outline-none transition focus:border-primary focus:ring-4 focus:ring-brand-100"
                  />
                </label>

                <div className="grid gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                    Count toward plan
                  </span>

                  <button
                    type="button"
                    aria-pressed={course.completed}
                    onClick={() =>
                      updateCourse(course.id, {
                        completed: !course.completed,
                      })
                    }
                    className={
                      course.completed
                        ? "min-h-11 rounded-xl border border-border-strong bg-surface-muted px-4 text-sm font-semibold text-text-secondary transition hover:border-danger-500 hover:bg-danger-50 hover:text-danger-700 dark:hover:bg-danger-700/15 dark:hover:text-red-300"
                        : "min-h-11 rounded-xl border border-primary bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover"
                    }>
                    {course.completed ? "Exclude" : "Include"}
                  </button>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${course.normalizedTitle}`}
                  onClick={() => removeCourse(course.id)}>
                  <Trash2 className="size-4 text-danger-600" />
                </Button>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-text-tertiary">
                <span>Original: {course.originalName}</span>

                <span aria-hidden="true">•</span>

                <span>Confidence: {Math.round(course.confidence * 100)}%</span>

                {course.grade ? (
                  <>
                    <span aria-hidden="true">•</span>
                    <span>Grade: {course.grade}</span>
                  </>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
