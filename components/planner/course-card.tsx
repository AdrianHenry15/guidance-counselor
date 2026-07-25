"use client"

import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BookOpen,
  Clock3,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { PlannedCourse } from "@/types/academic.type"
import type { PlanValidationIssue } from "@/types/plan-validation.type"

interface CourseCardProps {
  course: PlannedCourse
  editable?: boolean
  canMoveEarlier?: boolean
  canMoveLater?: boolean
  onMoveEarlier?: () => void
  onMoveLater?: () => void
  validationIssues?: PlanValidationIssue[]
}

/**
 * Displays one planned course, optional move controls, and course-level issues.
 */
export function CourseCard({
  course,
  editable = false,
  canMoveEarlier = false,
  canMoveLater = false,
  onMoveEarlier,
  onMoveLater,
  validationIssues = [],
}: CourseCardProps) {
  const subjectLabel = course.subjectArea.replaceAll("_", " ").toUpperCase()

  const hasErrors = validationIssues.some((issue) => issue.severity === "error")

  const hasWarnings = validationIssues.some(
    (issue) => issue.severity === "warning",
  )

  return (
    <div
      className={cn(
        "rounded-2xl border p-4 sm:p-5",
        hasErrors
          ? "border-danger bg-danger-subtle"
          : hasWarnings
            ? "border-warning bg-warning-subtle"
            : "border-border bg-surface-muted",
      )}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-primary">
            <BookOpen className="size-5" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-text-primary">
                {course.title}
              </h3>

              <Badge variant="accent">{course.status}</Badge>
            </div>

            <p className="mt-1 text-xs font-semibold tracking-[0.08em] text-text-tertiary">
              {subjectLabel}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-xs font-semibold text-text-secondary">
            <Clock3 className="size-3.5" />
            {course.credits} credits
          </div>

          {editable ? (
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Move ${course.title} to the previous semester`}
                title="Move to previous semester"
                disabled={!canMoveEarlier}
                onClick={onMoveEarlier}>
                <ArrowUp className="size-4" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Move ${course.title} to the next semester`}
                title="Move to next semester"
                disabled={!canMoveLater}
                onClick={onMoveLater}>
                <ArrowDown className="size-4" />
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      {course.description ? (
        <p className="mt-4 text-sm leading-6 text-text-secondary">
          {course.description}
        </p>
      ) : null}

      {course.prerequisites?.length ? (
        <p className="mt-4 text-xs font-medium text-text-tertiary">
          Prerequisites: {course.prerequisites.length} required
        </p>
      ) : null}

      {validationIssues.length > 0 ? (
        <div className="mt-4 space-y-2">
          {validationIssues.map((issue) => (
            <div
              key={issue.id}
              role={issue.severity === "error" ? "alert" : undefined}
              className={cn(
                "flex items-start gap-2 rounded-xl border p-3 text-sm",
                issue.severity === "error"
                  ? "border-danger bg-danger-subtle text-danger-text"
                  : "border-warning bg-warning-subtle text-warning-text",
              )}>
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />

              <p className="leading-5">{issue.message}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
