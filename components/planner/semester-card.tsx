import { AlertTriangle, CalendarDays } from "lucide-react"

import { CourseCard } from "@/components/planner/course-card"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { PlannedSemester } from "@/types/academic.type"
import type { PlanValidationIssue } from "@/types/plan-validation.type"

interface SemesterCardProps {
  semester: PlannedSemester
  semesterIndex?: number
  semesterCount?: number
  editable?: boolean
  onMoveCourse?: (courseId: string, direction: "earlier" | "later") => void
  validationIssues?: PlanValidationIssue[]
}

/**
 * Displays one semester, its courses, and associated validation issues.
 */
export function SemesterCard({
  semester,
  semesterIndex,
  semesterCount,
  editable = false,
  onMoveCourse,
  validationIssues = [],
}: SemesterCardProps) {
  const totalCredits = semester.courses.reduce(
    (total, course) => total + course.credits,
    0,
  )

  /**
   * Semester issues have no specific course association.
   */
  const semesterIssues = validationIssues.filter((issue) => !issue.courseId)

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-border bg-surface-subtle p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-(image:--gradient-primary) text-brand-on-surface shadow-sm">
            <CalendarDays className="size-5" />
          </div>

          <div>
            <h2 className="font-display text-lg font-bold tracking-tight text-text-primary">
              {semester.label}
            </h2>

            <p className="mt-0.5 text-sm text-text-tertiary">
              {semester.courses.length} planned{" "}
              {semester.courses.length === 1 ? "course" : "courses"}
            </p>
          </div>
        </div>

        <div className="inline-flex w-fit items-center rounded-full bg-primary-subtle px-3 py-1.5 text-sm font-semibold text-primary">
          {totalCredits} credits
        </div>
      </div>

      {semesterIssues.length > 0 ? (
        <div className="space-y-2 border-b border-border p-5 sm:px-6">
          {semesterIssues.map((issue) => (
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

      <div className="space-y-3 p-5 sm:p-6">
        {semester.courses.map((course) => {
          const canMoveEarlier =
            editable && semesterIndex !== undefined && semesterIndex > 0

          const canMoveLater =
            editable &&
            semesterIndex !== undefined &&
            semesterCount !== undefined &&
            semesterIndex < semesterCount - 1

          /**
           * Issues with a course ID belong directly to this course.
           */
          const courseIssues = validationIssues.filter(
            (issue) => issue.courseId === course.id,
          )

          return (
            <CourseCard
              key={course.id}
              course={course}
              editable={editable}
              canMoveEarlier={canMoveEarlier}
              canMoveLater={canMoveLater}
              validationIssues={courseIssues}
              onMoveEarlier={
                editable && onMoveCourse
                  ? () => onMoveCourse(course.id, "earlier")
                  : undefined
              }
              onMoveLater={
                editable && onMoveCourse
                  ? () => onMoveCourse(course.id, "later")
                  : undefined
              }
            />
          )
        })}
      </div>
    </Card>
  )
}
