import { PlannedCourse } from "@/types/academic.type"
import { BookOpen, Clock } from "lucide-react"

interface CourseCardProps {
  course: PlannedCourse
}

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

export function CourseCard({ course }: CourseCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          <BookOpen className="size-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-slate-950">{course.title}</h3>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                {subjectLabels[course.subjectArea]}
              </p>
            </div>

            <div className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              <Clock className="size-3.5" />
              {course.credits} credits
            </div>
          </div>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            {course.description}
          </p>

          {course.prerequisites?.length ? (
            <p className="mt-3 text-xs text-slate-500">
              Prerequisites: {course.prerequisites.length} required
            </p>
          ) : null}
        </div>
      </div>
    </article>
  )
}
