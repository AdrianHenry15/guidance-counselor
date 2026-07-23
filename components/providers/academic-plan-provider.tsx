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

export function AcademicPlanProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [transcriptAnalysis, setAnalysis] = useState<TranscriptAnalysis | null>(
    null,
  )

  const [generatedPlan, setPlan] = useState<StudentAcademicPlan | null>(null)

  const setTranscriptAnalysis = useCallback((analysis: TranscriptAnalysis) => {
    setAnalysis(analysis)

    // A new transcript invalidates the old generated plan.
    setPlan(null)
  }, [])

  const updateTranscriptAnalysis = useCallback(
    (analysis: TranscriptAnalysis) => {
      setAnalysis(analysis)

      // Any transcript edit makes the existing plan stale.
      setPlan(null)
    },
    [],
  )

  const setGeneratedPlan = useCallback((plan: StudentAcademicPlan) => {
    setPlan(plan)
  }, [])

  const clearTranscriptAnalysis = useCallback(() => {
    setAnalysis(null)
  }, [])

  const clearGeneratedPlan = useCallback(() => {
    setPlan(null)
  }, [])

  const clearAcademicPlan = useCallback(() => {
    setAnalysis(null)
    setPlan(null)
  }, [])

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

export function useAcademicPlan() {
  const context = useContext(AcademicPlanContext)

  if (!context) {
    throw new Error("useAcademicPlan must be used within AcademicPlanProvider")
  }

  return context
}
