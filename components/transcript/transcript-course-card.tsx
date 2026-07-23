"use client"

import { Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { subjectOptions } from "@/data/subject-options"
import type { SubjectArea } from "@/types/academic.type"
import type { TranscriptCourse } from "@/types/transcript.type"

interface TranscriptCourseCardProps {
  course: TranscriptCourse
  onUpdate: (courseId: string, updates: Partial<TranscriptCourse>) => void
  onRemove: (courseId: string) => void
}

export function TranscriptCourseCard({
  course,
  onUpdate,
  onRemove,
}: TranscriptCourseCardProps) {
  const isPassed = course.completionStatus === "passed"

  function updateCourse(updates: Partial<TranscriptCourse>) {
    onUpdate(course.id, updates)
  }

  return (
    <Card className="p-4 sm:p-5">
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr_120px_140px_auto] lg:items-end">
        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
            Course
          </span>

          <input
            value={course.normalizedTitle}
            onChange={(event) =>
              updateCourse({
                normalizedTitle: event.target.value,
              })
            }
            className="min-h-11 rounded-xl border border-border-strong bg-surface px-3 text-sm text-text-primary outline-none transition focus:border-primary focus:ring-4 focus:ring-brand-100"
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
            Subject
          </span>

          <select
            value={course.subjectArea}
            onChange={(event) =>
              updateCourse({
                subjectArea: event.target.value as SubjectArea,
              })
            }
            className="min-h-11 rounded-xl border border-border-strong bg-surface px-3 text-sm text-text-primary outline-none transition focus:border-primary focus:ring-4 focus:ring-brand-100">
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

              updateCourse({
                credits: Number.isFinite(credits) ? credits : 0,
              })
            }}
            className="min-h-11 rounded-xl border border-border-strong bg-surface px-3 text-sm text-text-primary outline-none transition focus:border-primary focus:ring-4 focus:ring-brand-100"
          />
        </label>

        <div className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
            Count toward plan
          </span>

          <button
            type="button"
            disabled={!isPassed}
            aria-pressed={course.includedInPlan}
            onClick={() =>
              updateCourse({
                includedInPlan: !course.includedInPlan,
              })
            }
            className={
              !isPassed
                ? "min-h-11 cursor-not-allowed rounded-xl border border-border bg-surface-muted px-4 text-sm font-semibold text-text-disabled opacity-70"
                : course.includedInPlan
                  ? "min-h-11 rounded-xl border border-border-strong bg-surface-muted px-4 text-sm font-semibold text-text-secondary transition hover:border-danger-500 hover:bg-danger-50 hover:text-danger-700 dark:hover:bg-danger-700/15 dark:hover:text-red-300"
                  : "min-h-11 rounded-xl border border-primary bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover"
            }>
            {!isPassed
              ? "Not eligible"
              : course.includedInPlan
                ? "Exclude"
                : "Include"}
          </button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          aria-label={`Remove ${course.normalizedTitle}`}
          title="Remove course"
          onClick={() => onRemove(course.id)}>
          <Trash2 className="size-4 text-danger-600" />
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-border pt-3 text-xs text-text-tertiary">
        <span>Original: {course.originalName}</span>

        <span aria-hidden="true">•</span>

        <span>Status: {course.completionStatus.replaceAll("_", " ")}</span>

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
  )
}
