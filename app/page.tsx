// src/app/page.tsx

import Link from "next/link"
import {
  ArrowRight,
  Check,
  FileSearch,
  GraduationCap,
  Route,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const features = [
  {
    title: "Analyze completed courses",
    description:
      "Convert transcript entries into generalized subjects and course categories.",
    icon: FileSearch,
  },
  {
    title: "Map degree requirements",
    description:
      "Compare earned credits against a generalized academic program.",
    icon: GraduationCap,
  },
  {
    title: "Build a semester plan",
    description:
      "Create a balanced path based on prerequisites and credit preferences.",
    icon: Route,
  },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-slate-950 text-white">
              <GraduationCap className="size-5" />
            </div>

            <span className="font-bold text-slate-950">Guidance Counselor</span>
          </Link>

          <Link href="/dashboard">
            <Button variant="secondary">Open dashboard</Button>
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:items-center lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Academic planning made understandable
          </p>

          <h1 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Turn your transcript into a clear path forward.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Guidance Counselor reviews completed coursework and builds a
            generalized semester plan that you can verify with your school.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/upload">
              <Button className="w-full sm:w-auto">
                Upload transcript
                <ArrowRight className="size-4" />
              </Button>
            </Link>

            <Link href="/planner">
              <Button variant="secondary" className="w-full sm:w-auto">
                View sample plan
              </Button>
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-600">
            <span className="flex items-center gap-2">
              <Check className="size-4" />
              Generalized course planning
            </span>
            <span className="flex items-center gap-2">
              <Check className="size-4" />
              Manual corrections
            </span>
            <span className="flex items-center gap-2">
              <Check className="size-4" />
              Mobile friendly
            </span>
          </div>
        </div>

        <Card className="grid gap-4 p-5 sm:p-7">
          {features.map((feature) => {
            const Icon = feature.icon

            return (
              <article
                key={feature.title}
                className="flex gap-4 rounded-2xl bg-slate-50 p-5">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
                  <Icon className="size-5" />
                </div>

                <div>
                  <h2 className="font-bold text-slate-950">{feature.title}</h2>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {feature.description}
                  </p>
                </div>
              </article>
            )
          })}
        </Card>
      </section>
    </main>
  )
}
