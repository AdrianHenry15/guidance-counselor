"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { AppShell } from "@/components/layout/app-shell"
import { PlanningPreferences } from "@/components/planner/planning-preferences"
import { useAcademicPlan } from "@/components/providers/academic-plan-provider"
import { TranscriptCourseCard } from "@/components/transcript/transcript-course-card"
import { TranscriptReviewSummary } from "@/components/transcript/transcript-review-summary"
import { TranscriptWarnings } from "@/components/transcript/transcript-warnings"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useGenerateAcademicPlan } from "@/hooks/use-generate-academic-plan"
import {
  calculateIncludedCourseCount,
  calculateIncludedCredits,
} from "@/lib/transcript/transcript-course-utils"
import type { GeneratePlanOptions } from "@/types/planner.type"
import type {
  TranscriptAnalysis,
  TranscriptCourse,
} from "@/types/transcript.type"

const defaultPlanOptions: GeneratePlanOptions = {
  startTerm: "fall",
  startYear: 2027,
  fallSpringCreditTarget: 12,
  summerCreditTarget: 6,
  includeSummer: true,
}

interface ReviewContentProps {
  analysis: TranscriptAnalysis
  planOptions: GeneratePlanOptions
  onPlanOptionsChange: (options: GeneratePlanOptions) => void
  onUpdateAnalysis: (analysis: TranscriptAnalysis) => void
}

function ReviewContent({
  analysis,
  planOptions,
  onPlanOptionsChange,
  onUpdateAnalysis,
}: ReviewContentProps) {
  const { generatePlan, isGenerating, generationError } =
    useGenerateAcademicPlan({
      analysis,
      options: planOptions,
    })

  function saveCourses(courses: TranscriptCourse[]) {
    onUpdateAnalysis({
      ...analysis,
      courses,
      estimatedCreditsEarned: calculateIncludedCredits(courses),
    })
  }

  function updateCourse(courseId: string, updates: Partial<TranscriptCourse>) {
    const updatedCourses = analysis.courses.map((course) =>
      course.id === courseId
        ? {
            ...course,
            ...updates,
          }
        : course,
    )

    saveCourses(updatedCourses)
  }

  function removeCourse(courseId: string) {
    const updatedCourses = analysis.courses.filter(
      (course) => course.id !== courseId,
    )

    saveCourses(updatedCourses)
  }

  const includedCourseCount = calculateIncludedCourseCount(analysis.courses)

  return (
    <AppShell
      title="Transcript Review"
      description="Confirm your completed coursework">
      <div className="space-y-6">
        <TranscriptReviewSummary
          fileName={analysis.fileName}
          detectedCourseCount={analysis.courses.length}
          includedCourseCount={includedCourseCount}
          earnedCredits={analysis.estimatedCreditsEarned}
          isGenerating={isGenerating}
          generationError={generationError}
          onGenerate={generatePlan}
        />

        <Card className="p-5 sm:p-6">
          <div className="mb-5">
            <h2 className="font-display text-lg font-bold text-text-primary">
              Planning preferences
            </h2>

            <p className="mt-1 text-sm text-text-secondary">
              Choose when the plan starts and how many credits you want each
              term.
            </p>
          </div>

          <PlanningPreferences
            value={planOptions}
            onChange={onPlanOptionsChange}
            disabled={isGenerating}
          />
        </Card>

        <TranscriptWarnings warnings={analysis.warnings} />

        <div className="space-y-4">
          {analysis.courses.map((course) => (
            <TranscriptCourseCard
              key={course.id}
              course={course}
              onUpdate={updateCourse}
              onRemove={removeCourse}
            />
          ))}
        </div>
      </div>
    </AppShell>
  )
}

export default function TranscriptReviewPage() {
  const router = useRouter()

  const { transcriptAnalysis, updateTranscriptAnalysis } = useAcademicPlan()

  const [planOptions, setPlanOptions] =
    useState<GeneratePlanOptions>(defaultPlanOptions)

  if (!transcriptAnalysis) {
    return (
      <AppShell
        title="Transcript Review"
        description="Review detected coursework">
        <Card className="mx-auto max-w-xl p-6 text-center">
          <h2 className="font-display text-xl font-bold text-text-primary">
            No transcript analysis found
          </h2>

          <p className="mt-2 text-sm text-text-secondary">
            Upload a transcript before reviewing coursework.
          </p>

          <Button className="mt-5" onClick={() => router.push("/upload")}>
            Upload transcript
          </Button>
        </Card>
      </AppShell>
    )
  }

  return (
    <ReviewContent
      analysis={transcriptAnalysis}
      planOptions={planOptions}
      onPlanOptionsChange={setPlanOptions}
      onUpdateAnalysis={updateTranscriptAnalysis}
    />
  )
}
