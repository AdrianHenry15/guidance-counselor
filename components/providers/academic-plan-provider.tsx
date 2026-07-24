"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react"

import type { StudentAcademicPlan } from "@/types/academic.type"
import type { TranscriptAnalysis } from "@/types/transcript.type"

/**
 * Shared transcript and generated-plan state.
 */
interface AcademicPlanContextValue {
  transcriptAnalysis: TranscriptAnalysis | null
  generatedPlan: StudentAcademicPlan | null

  setTranscriptAnalysis: (analysis: TranscriptAnalysis) => void

  updateTranscriptAnalysis: (analysis: TranscriptAnalysis) => void

  setGeneratedPlan: (plan: StudentAcademicPlan) => void

  clearTranscriptAnalysis: () => void
  clearGeneratedPlan: () => void
  clearAcademicPlan: () => void
}

const AcademicPlanContext = createContext<AcademicPlanContextValue | null>(null)

/**
 * Provides in-memory academic planning state across client routes.
 */
export function AcademicPlanProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [transcriptAnalysis, setAnalysis] = useState<TranscriptAnalysis | null>(
    null,
  )

  const [generatedPlan, setPlan] = useState<StudentAcademicPlan | null>(null)

  /**
   * Stores a new transcript and invalidates the previous plan.
   */
  const setTranscriptAnalysis = useCallback((analysis: TranscriptAnalysis) => {
    setAnalysis(analysis)

    // A new transcript invalidates the old generated plan.
    setPlan(null)
  }, [])

  /**
   * Saves transcript edits and marks the generated plan as stale.
   */
  const updateTranscriptAnalysis = useCallback(
    (analysis: TranscriptAnalysis) => {
      setAnalysis(analysis)

      // Any transcript edit makes the existing plan stale.
      setPlan(null)
    },
    [],
  )

  /**
   * Stores the latest generated academic plan.
   */
  const setGeneratedPlan = useCallback((plan: StudentAcademicPlan) => {
    setPlan(plan)
  }, [])

  const clearTranscriptAnalysis = useCallback(() => {
    setAnalysis(null)
  }, [])

  const clearGeneratedPlan = useCallback(() => {
    setPlan(null)
  }, [])

  /**
   * Clears the entire planning workflow.
   */
  const clearAcademicPlan = useCallback(() => {
    setAnalysis(null)
    setPlan(null)
  }, [])

  /**
   * Memoizes the context value to avoid unnecessary consumer updates.
   */
  const value = useMemo(
    () => ({
      transcriptAnalysis,
      generatedPlan,
      setTranscriptAnalysis,
      updateTranscriptAnalysis,
      setGeneratedPlan,
      clearTranscriptAnalysis,
      clearGeneratedPlan,
      clearAcademicPlan,
    }),
    [
      transcriptAnalysis,
      generatedPlan,
      setTranscriptAnalysis,
      updateTranscriptAnalysis,
      setGeneratedPlan,
      clearTranscriptAnalysis,
      clearGeneratedPlan,
      clearAcademicPlan,
    ],
  )

  return (
    <AcademicPlanContext.Provider value={value}>
      {children}
    </AcademicPlanContext.Provider>
  )
}

/**
 * Returns the academic-plan context for client components.
 */
export function useAcademicPlan() {
  const context = useContext(AcademicPlanContext)

  if (!context) {
    throw new Error("useAcademicPlan must be used within AcademicPlanProvider")
  }

  return context
}
