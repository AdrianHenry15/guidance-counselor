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
import { createTranscriptCourse } from "@/lib/transcript/create-transcript-course"
import { Plus } from "lucide-react"

/**
 * Default scheduling preferences shown when the user first reaches
 * the transcript-review page.
 *
 * These values are held in local component state and are submitted to the
 * planner only when the user generates an academic plan.
 */
const defaultPlanOptions: GeneratePlanOptions = {
  programId: "bachelor-computer-science",
  priorCredential: "none",
  startTerm: "fall",
  startYear: new Date().getFullYear() + 1,
  fallSpringCreditTarget: 12,
  summerCreditTarget: 6,
  includeSummer: true,
}

/**
 * Props used by the review workflow once transcript analysis is available.
 *
 * Keeping the analyzed state and state-update function outside this component
 * makes the page-level empty state easier to handle.
 */
interface ReviewContentProps {
  analysis: TranscriptAnalysis
  planOptions: GeneratePlanOptions
  onPlanOptionsChange: (options: GeneratePlanOptions) => void
  onUpdateAnalysis: (analysis: TranscriptAnalysis) => void
}

/**
 * Renders the transcript-review workflow after a transcript has been analyzed.
 *
 * Responsibilities:
 *
 * - display transcript summary information
 * - allow course corrections and exclusions
 * - collect planning preferences
 * - generate the academic plan
 */
function ReviewContent({
  analysis,
  planOptions,
  onPlanOptionsChange,
  onUpdateAnalysis,
}: ReviewContentProps) {
  /**
   * Encapsulates the plan-generation API request, loading state, errors,
   * generated-plan storage, and navigation to the generated-plan page.
   */
  const { generatePlan, isGenerating, generationError } =
    useGenerateAcademicPlan({
      analysis,
      options: planOptions,
    })

  /**
   * Persists a complete updated course collection back into shared context.
   *
   * Earned credits are recalculated after every edit so the summary remains
   * synchronized with the reviewed course data.
   */
  function saveCourses(courses: TranscriptCourse[]) {
    onUpdateAnalysis({
      ...analysis,
      courses,
      estimatedCreditsEarned: calculateIncludedCredits(courses),
    })
  }

  /**
   * Applies a partial update to one detected transcript course.
   *
   * This supports edits to title, subject area, credits, and inclusion state
   * without replacing the rest of the course object.
   */
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

  /**
   * Permanently removes a detected course row from the current analysis.
   *
   * Exclusion should be used when a valid course should not count toward the
   * plan. Removal is intended for incorrect or duplicate transcript rows.
   */
  function removeCourse(courseId: string) {
    const updatedCourses = analysis.courses.filter(
      (course) => course.id !== courseId,
    )

    saveCourses(updatedCourses)
  }

  /**
   * Adds a blank course row for manual transcript entry.
   */
  function addCourse() {
    const newCourse = createTranscriptCourse()

    saveCourses([newCourse, ...analysis.courses])
  }

  // Manually Added courses on Transcript upload
  const manuallyAddedCourses = analysis.courses.filter(
    (course) => course.source === "manual",
  )

  // Extracted courses on Transcript upload
  const extractedCourses = analysis.courses.filter(
    (course) => course.source !== "manual",
  )

  /**
   * Counts only passed courses that are currently included in planning.
   */
  const includedCourseCount = calculateIncludedCourseCount(analysis.courses)

  return (
    <AppShell
      title="Transcript Review"
      description="Confirm your completed coursework">
      <div className="space-y-6">
        {/*
         * Displays transcript-level totals and owns the primary
         * plan-generation action.
         */}
        <TranscriptReviewSummary
          fileName={analysis.fileName}
          isManual={analysis.fileName === "Manual transcript"}
          detectedCourseCount={analysis.courses.length}
          includedCourseCount={includedCourseCount}
          earnedCredits={analysis.estimatedCreditsEarned}
          isGenerating={isGenerating}
          generationError={generationError}
          onGenerate={generatePlan}
        />

        {/*
         * Collects the semester-start and credit-load preferences that will
         * control the generated schedule.
         */}
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

        {/*
         * Non-fatal parser or extraction concerns are shown before the user
         * reviews individual courses.
         */}
        <TranscriptWarnings warnings={analysis.warnings} />

        {/*
         * Each detected course is editable and can be included, excluded,
         * corrected, or removed before plan generation.
         */}
        <section className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-text-primary">
                Reviewed courses
              </h2>

              <p className="mt-1 text-sm text-text-secondary">
                Correct detected coursework or add any missing courses manually.
              </p>
            </div>

            <Button
              type="button"
              variant="secondary"
              onClick={addCourse}
              disabled={isGenerating}>
              <Plus className="size-4" />
              Add course
            </Button>
          </div>

          {analysis.courses.length === 0 ? (
            <Card className="border-dashed p-6 text-center">
              <h3 className="font-display text-lg font-bold text-text-primary">
                No courses added yet
              </h3>

              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Add your completed courses to begin building an academic plan.
              </p>

              <Button
                type="button"
                className="mt-5"
                onClick={addCourse}
                disabled={isGenerating}>
                <Plus className="size-4" />
                Add your first course
              </Button>
            </Card>
          ) : null}

          {/* Manually Added Courses on Transcript upload */}
          {manuallyAddedCourses.length > 0 ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-display text-base font-bold text-text-primary">
                  Added courses
                </h3>

                <p className="mt-1 text-sm text-text-secondary">
                  Courses you entered manually.
                </p>
              </div>

              {manuallyAddedCourses.map((course) => (
                <TranscriptCourseCard
                  key={course.id}
                  course={course}
                  onUpdate={updateCourse}
                  onRemove={removeCourse}
                />
              ))}
            </div>
          ) : null}

          {extractedCourses.length > 0 ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-display text-base font-bold text-text-primary">
                  Transcript courses
                </h3>

                <p className="mt-1 text-sm text-text-secondary">
                  Courses detected from your uploaded transcript.
                </p>
              </div>
              {/* Extracted courses on Transcript upload */}
              {extractedCourses.map((course) => (
                <TranscriptCourseCard
                  key={course.id}
                  course={course}
                  onUpdate={updateCourse}
                  onRemove={removeCourse}
                />
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </AppShell>
  )
}

/**
 * Transcript-review route.
 *
 * The page reads the current transcript analysis from shared in-memory state.
 * Without an active analysis, it shows an empty state that directs the user
 * back to the transcript-upload workflow.
 */
export default function TranscriptReviewPage() {
  const router = useRouter()

  /**
   * Shared transcript state is provided by AcademicPlanProvider.
   *
   * Updating the transcript analysis should also invalidate any previously
   * generated academic plan because the source data has changed.
   */
  const { transcriptAnalysis, updateTranscriptAnalysis } = useAcademicPlan()

  /**
   * Planning preferences remain local to this page until plan generation.
   */
  const [planOptions, setPlanOptions] =
    useState<GeneratePlanOptions>(defaultPlanOptions)

  /**
   * A transcript must be uploaded and analyzed before this page can render
   * the review workflow.
   */
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
