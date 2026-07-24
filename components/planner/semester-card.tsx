import type { PlannedSemester } from "@/types/academic.type"
import { CalendarDays } from "lucide-react"

import { CourseCard } from "@/components/planner/course-card"
import { Card } from "@/components/ui/card"

/**
 * Props for one planned semester.
 */
interface SemesterCardProps {
  semester: PlannedSemester
}

/**
 * Displays a semester summary and its planned courses.
 */
export function SemesterCard({ semester }: SemesterCardProps) {
  const totalCredits = semester.courses.reduce(
    (total, course) => total + course.credits,
    0,
  )

  return (
    <Card className="overflow-hidden">
      {/*
       * Semester header with term details and total scheduled credits.
       */}
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
              {semester.courses.length} planned courses
            </p>
          </div>
        </div>

        <div className="inline-flex w-fit items-center rounded-full bg-primary-subtle px-3 py-1.5 text-sm font-semibold text-primary">
          {totalCredits} credits
        </div>
      </div>

      {/*
       * Render each course scheduled for this semester.
       */}
      <div className="grid gap-3 bg-surface p-4 sm:p-5">
        {semester.courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </Card>
  )
}
