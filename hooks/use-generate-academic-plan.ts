"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { useAcademicPlan } from "@/components/providers/academic-plan-provider"
import { getIncludedPassedCourses } from "@/lib/transcript/transcript-course-utils"
import type { StudentAcademicPlan } from "@/types/academic.type"
import type { GeneratePlanOptions } from "@/types/planner.type"
import type { TranscriptAnalysis } from "@/types/transcript.type"

/**
 * Inputs required to generate a plan from reviewed transcript data.
 */
interface UseGenerateAcademicPlanArguments {
  analysis: TranscriptAnalysis
  options: GeneratePlanOptions
}
/**
 * Expected response from the plan-generation API.
 */
interface GeneratePlanResponse {
  success: boolean
  plan?: StudentAcademicPlan
  error?: string
}

/**
 * Handles plan generation, loading state, errors, storage, and navigation.
 */
export function useGenerateAcademicPlan({
  analysis,
  options,
}: UseGenerateAcademicPlanArguments) {
  const router = useRouter()
  const { setGeneratedPlan } = useAcademicPlan()

  const [isGenerating, setIsGenerating] = useState(false)

  const [generationError, setGenerationError] = useState("")

  async function generatePlan() {
    /**
     * Prevent generation without at least one eligible course.
     */
    const includedCourses = getIncludedPassedCourses(analysis.courses)

    if (!includedCourses.length) {
      setGenerationError(
        "Include at least one passed course before generating your plan.",
      )

      return
    }

    try {
      setIsGenerating(true)
      setGenerationError("")

      const response = await fetch("/api/planner/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcriptCourses: analysis.courses,
          options,
        }),
      })

      const result = (await response.json()) as GeneratePlanResponse

      if (!response.ok || !result.success || !result.plan) {
        throw new Error(result.error ?? "Academic plan generation failed.")
      }

      /**
       * Store the generated plan before opening the results page.
       */
      setGeneratedPlan(result.plan)
      router.push("/planner/generated")
    } catch (error) {
      setGenerationError(
        error instanceof Error
          ? error.message
          : "Academic plan generation failed.",
      )
    } finally {
      setIsGenerating(false)
    }
  }

  return {
    generatePlan,
    isGenerating,
    generationError,
  }
}
