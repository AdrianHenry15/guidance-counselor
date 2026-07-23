import { CalendarDays } from "lucide-react"

import { Card } from "@/components/ui/card"

import { CourseCard } from "./course-card"
import { PlannedSemester } from "@/types/academic.type"

interface SemesterCardProps {
  semester: PlannedSemester
}

export function SemesterCard({ semester }: SemesterCardProps) {
  const totalCredits = semester.courses.reduce(
    (total, course) => total + course.credits,
    0,
  )

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-slate-950 text-white">
            <CalendarDays className="size-5" />
          </div>

          <div>
            <h2 className="font-bold text-slate-950">{semester.label}</h2>
            <p className="text-sm text-slate-500">
              {semester.courses.length} planned courses
            </p>
          </div>
        </div>

        <div className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">
          {totalCredits} credits
        </div>
      </div>

      <div className="grid gap-3 p-4 sm:p-5">
        {semester.courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </Card>
  )
}
