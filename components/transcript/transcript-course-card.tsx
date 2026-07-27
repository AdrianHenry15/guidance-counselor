"use client"

import { useState } from "react"
import { CheckCircle2, ChevronDown, CircleAlert, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { NumberInput } from "@/components/ui/number-input"
import { Select } from "@/components/ui/select"
import { subjectOptions } from "@/data/subject-options"
import { cn } from "@/lib/utils"
import type { SubjectArea } from "@/types/academic.type"
import type {
  TranscriptCompletionStatus,
  TranscriptCourse,
} from "@/types/transcript.type"

/**
 * Props for one editable transcript course card.
 */
interface TranscriptCourseCardProps {
  course: TranscriptCourse
  onUpdate: (courseId: string, updates: Partial<TranscriptCourse>) => void
  onRemove: (courseId: string) => void
}

const statusLabels: Record<TranscriptCompletionStatus, string> = {
  passed: "Passed",
  failed: "Failed",
  withdrawn: "Withdrawn",
  in_progress: "In progress",
  unknown: "Unknown",
}

const statusStyles: Record<TranscriptCompletionStatus, string> = {
  passed: "bg-success-subtle text-success-text",
  failed: "bg-danger-subtle text-danger-text",
  withdrawn: "bg-warning-subtle text-warning-text",
  in_progress: "bg-info-subtle text-info-text",
  unknown: "bg-surface-muted text-text-secondary",
}

const titleInputClassName =
  "min-h-11 w-full rounded-xl border border-border-strong bg-surface px-3 py-2 text-sm text-text-primary outline-none transition placeholder:text-text-tertiary focus:border-primary focus:ring-4 focus:ring-primary-subtle disabled:cursor-not-allowed disabled:opacity-60"

/**
 * Displays a compact transcript summary that expands into editing controls.
 */
export function TranscriptCourseCard({
  course,
  onUpdate,
  onRemove,
}: TranscriptCourseCardProps) {
  const isPassed = course.completionStatus === "passed"

  const displayTitle = course.normalizedTitle.trim() || "Untitled course"

  const editorId = `transcript-course-editor-${course.id}`

  const [isExpanded, setIsExpanded] = useState(
    course.source === "manual" && !course.normalizedTitle.trim(),
  )

  /**
   * Applies a partial update to the current course.
   */
  function updateCourse(updates: Partial<TranscriptCourse>) {
    onUpdate(course.id, updates)
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center gap-2 p-4 sm:px-5">
        <button
          type="button"
          aria-expanded={isExpanded}
          aria-controls={editorId}
          onClick={() => setIsExpanded((current) => !current)}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-lg text-left outline-none focus-visible:ring-4 focus-visible:ring-primary-subtle">
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-full",
              statusStyles[course.completionStatus],
            )}>
            {isPassed ? (
              <CheckCircle2 className="size-5" />
            ) : (
              <CircleAlert className="size-5" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "truncate text-sm font-semibold sm:text-base",
                isPassed ? "text-success-text" : "text-text-primary",
              )}>
              {displayTitle}
            </p>

            <p className="mt-0.5 text-xs text-text-tertiary">
              Click to {isExpanded ? "close editor" : "review or edit"}
            </p>
          </div>

          <span className="shrink-0 rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold text-text-secondary">
            {course.credits} {course.credits === 1 ? "credit" : "credits"}
          </span>

          <ChevronDown
            aria-hidden="true"
            className={cn(
              "size-4 shrink-0 text-text-tertiary transition-transform",
              isExpanded && "rotate-180",
            )}
          />
        </button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Remove ${displayTitle}`}
          title="Remove course"
          onClick={() => onRemove(course.id)}
          className="shrink-0">
          <Trash2 className="size-4 text-danger" />
        </Button>
      </div>

      {isExpanded ? (
        <div
          id={editorId}
          className="border-t border-border bg-surface-subtle p-4 sm:p-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {/* Course title */}
            <label className="grid min-w-0 gap-1.5 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                Course
              </span>

              <input
                value={course.normalizedTitle}
                placeholder="Course title"
                onChange={(event) =>
                  updateCourse({
                    normalizedTitle: event.target.value,
                  })
                }
                className={titleInputClassName}
              />
            </label>

            {/* Subject */}
            <label className="grid min-w-0 gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                Subject
              </span>

              <Select
                value={course.subjectArea}
                onChange={(event) =>
                  updateCourse({
                    subjectArea: event.target.value as SubjectArea,
                  })
                }>
                {subjectOptions.map((subject) => (
                  <option key={subject.value} value={subject.value}>
                    {subject.label}
                  </option>
                ))}
              </Select>
            </label>

            {/* Credits */}
            <label className="grid min-w-0 gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                Credits
              </span>

              <NumberInput
                min={0}
                max={12}
                step={0.5}
                value={course.credits}
                onChange={(event) => {
                  const credits = event.currentTarget.valueAsNumber

                  updateCourse({
                    credits: Number.isFinite(credits) ? credits : 0,
                  })
                }}
              />
            </label>

            {/* Status */}
            <label className="grid min-w-0 gap-1.5 md:col-span-1 xl:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                Status
              </span>

              <Select
                value={course.completionStatus}
                onChange={(event) => {
                  const completionStatus = event.target
                    .value as TranscriptCompletionStatus

                  updateCourse({
                    completionStatus,
                    includedInPlan: completionStatus === "passed",
                  })
                }}>
                <option value="passed">Passed</option>

                <option value="failed">Failed</option>

                <option value="withdrawn">Withdrawn</option>

                <option value="in_progress">In progress</option>

                <option value="unknown">Unknown</option>
              </Select>
            </label>

            {/* Include in plan */}
            <div className="grid min-w-0 gap-1.5 md:col-span-1 xl:col-span-2">
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
                className={cn(
                  "min-h-11 w-full rounded-xl border px-4 text-sm font-semibold transition",
                  !isPassed &&
                    "cursor-not-allowed border-border bg-surface-muted text-text-disabled opacity-70",
                  isPassed &&
                    course.includedInPlan &&
                    "border-border-strong bg-surface-muted text-text-secondary hover:border-danger hover:bg-danger-subtle hover:text-danger-text",
                  isPassed &&
                    !course.includedInPlan &&
                    "border-primary bg-primary text-brand-on-surface hover:bg-primary-hover",
                )}>
                {!isPassed
                  ? "Not eligible"
                  : course.includedInPlan
                    ? "Exclude from plan"
                    : "Include in plan"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-border bg-surface-muted px-4 py-3 text-xs text-text-tertiary sm:px-5">
        <span>
          {
            subjectOptions.find(
              (subject) => subject.value === course.subjectArea,
            )?.label
          }
        </span>

        <span aria-hidden="true">•</span>

        <span
          className={cn(
            "font-medium",
            isPassed ? "text-success-text" : "text-text-secondary",
          )}>
          {statusLabels[course.completionStatus]}
        </span>

        <span aria-hidden="true">•</span>

        <span>
          {course.source === "manual" ? "Manual entry" : "Transcript"}
        </span>

        {course.source !== "manual" ? (
          <>
            <span aria-hidden="true">•</span>

            <span>Confidence: {Math.round(course.confidence * 100)}%</span>
          </>
        ) : null}

        {course.grade ? (
          <>
            <span aria-hidden="true">•</span>

            <span>Grade: {course.grade}</span>
          </>
        ) : null}

        {course.source !== "manual" &&
        course.originalName !== course.normalizedTitle ? (
          <>
            <span aria-hidden="true">•</span>

            <span className="max-w-full truncate">
              Original: {course.originalName}
            </span>
          </>
        ) : null}
      </div>
    </Card>
  )
}
