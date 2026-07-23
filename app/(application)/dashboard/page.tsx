import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  FileCheck2,
  GraduationCap,
} from "lucide-react"

import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { sampleAcademicPlan } from "@/data/sample-plan"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Review academic progress, upcoming coursework, and graduation estimates.",
}

export default function DashboardPage() {
  const nextSemester = sampleAcademicPlan.semesters[0]

  return (
    <AppShell
      title="Dashboard"
      description="Review your progress and next academic steps">
      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-6">
          <Card className="overflow-hidden border-0 bg-image:(--gradient-hero) p-6 text-brand-on-surface shadow-lg sm:p-8">
            <div className="max-w-2xl">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-white/15 text-brand-on-surface">
                <GraduationCap className="size-6" />
              </div>

              <h2 className="mt-6 font-display text-2xl font-bold tracking-tight text-brand-on-surface sm:text-3xl">
                Your academic path is taking shape.
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-brand-on-surface-muted sm:text-base">
                Review your generalized degree plan, adjust your semester
                workload, and verify courses with your institution.
              </p>

              <Link href="/planner" className="mt-6 inline-block">
                <Button variant="on-brand">
                  View academic plan
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="p-5">
              <FileCheck2 className="size-5 text-slate-600" />
              <p className="mt-4 text-2xl font-bold text-slate-500">30</p>
              <p className="text-sm text-slate-500">Earned credits</p>
            </Card>

            <Card className="p-5">
              <BookOpen className="size-5 text-slate-600" />
              <p className="mt-4 text-2xl font-bold text-slate-500">30</p>
              <p className="text-sm text-slate-500">Planned credits</p>
            </Card>

            <Card className="p-5">
              <CalendarDays className="size-5 text-slate-600" />
              <p className="mt-4 text-lg font-bold text-slate-500">
                Spring 2030
              </p>
              <p className="text-sm text-slate-500">Estimated graduation</p>
            </Card>
          </div>

          <Card className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-bold text-slate-950">Degree progress</h2>
                <p className="mt-1 text-sm text-slate-500">
                  30 of approximately 120 credits completed
                </p>
              </div>

              <p className="text-xl font-bold text-slate-950">25%</p>
            </div>

            <div className="mt-5">
              <Progress value={30} max={120} />
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Progress label="General education" value={18} max={36} />
              <Progress label="Computer science" value={6} max={45} />
              <Progress label="Mathematics and science" value={6} max={23} />
              <Progress label="Electives" value={0} max={16} />
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Next semester
            </p>

            <h2 className="mt-2 text-xl font-bold text-slate-950">
              {nextSemester.label}
            </h2>

            <div className="mt-5 space-y-3">
              {nextSemester.courses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {course.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {course.subjectArea.replaceAll("-", " ")}
                    </p>
                  </div>

                  <p className="shrink-0 text-xs font-medium text-slate-500">
                    {course.credits} cr.
                  </p>
                </div>
              ))}
            </div>

            <Link href="/planner" className="mt-5 block">
              <Button variant="secondary" className="w-full">
                Review semester
              </Button>
            </Link>
          </Card>

          <Card className="p-5 sm:p-6">
            <h2 className="font-bold text-slate-950">Transcript status</h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Upload a transcript to replace sample data with your completed
              coursework.
            </p>

            <Link href="/upload" className="mt-5 block">
              <Button className="w-full">Upload transcript</Button>
            </Link>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
