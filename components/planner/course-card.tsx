import type { PlannedCourse } from "@/types/academic.type"
import { BookOpen, Clock } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { courseStatusBadge } from "@/components/ui/badge.config"

/**
 * Props for one planned course card.
 */
interface CourseCardProps {
  course: PlannedCourse
}

/**
 * Human-readable labels for subject-area values.
 */
const subjectLabels: Record<PlannedCourse["subjectArea"], string> = {
  english: "English",
  mathematics: "Mathematics",
  science: "Science",
  social_science: "Social Science",
  humanities: "Humanities",
  computer_science: "Computer Science",
  foreign_language: "Foreign Language",
  fine_arts: "Fine Arts",
  health: "Health",
  physical_education: "Physical Education",
  major_core: "Major Core",
  major_elective: "Major Elective",
  general_elective: "General Elective",
  college_success: "College Success",
}

/**
 * Displays one course within a planned semester.
 */
export function CourseCard({ course }: CourseCardProps) {
  return (
    <article className="relative overflow-hidden rounded-xl border border-border bg-surface p-4 text-text-primary shadow-xs">
      <div className="absolute inset-y-0 left-0 w-1 bg-(image:--gradient-progress)" />

      <div className="flex items-start gap-3 pl-2">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-subtle text-primary">
          <BookOpen className="size-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-text-primary">
                  {course.title}
                </h3>

                <Badge variant={courseStatusBadge[course.status]}>
                  {course.status.replaceAll("_", " ").replaceAll("-", " ")}
                </Badge>
              </div>

              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-text-tertiary">
                {subjectLabels[course.subjectArea]}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1 rounded-full bg-surface-muted px-2.5 py-1 text-xs font-medium text-text-secondary">
              <Clock className="size-3.5" />
              {course.credits} credits
            </div>
          </div>

          <p className="mt-3 text-sm leading-6 text-text-secondary">
            {course.description}
          </p>

          {course.prerequisites?.length ? (
            <p className="mt-3 text-xs text-text-tertiary">
              Prerequisites: {course.prerequisites.length} required
            </p>
          ) : null}
        </div>
      </div>
    </article>
  )
}
