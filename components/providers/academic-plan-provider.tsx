// components/providers/academic-plan-provider.tsx

"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react"

import type { TranscriptAnalysis } from "@/types/transcript.type"

interface AcademicPlanContextValue {
  transcriptAnalysis: TranscriptAnalysis | null
  setTranscriptAnalysis: (analysis: TranscriptAnalysis) => void
  updateTranscriptAnalysis: (analysis: TranscriptAnalysis) => void
  clearTranscriptAnalysis: () => void
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

  const setTranscriptAnalysis = useCallback((analysis: TranscriptAnalysis) => {
    setAnalysis(analysis)
    window.localStorage.setItem(
      "guidance-counselor-transcript",
      JSON.stringify(analysis),
    )
  }, [])

  const updateTranscriptAnalysis = useCallback(
    (analysis: TranscriptAnalysis) => {
      setAnalysis(analysis)
      window.localStorage.setItem(
        "guidance-counselor-transcript",
        JSON.stringify(analysis),
      )
    },
    [],
  )

  const clearTranscriptAnalysis = useCallback(() => {
    setAnalysis(null)
    window.localStorage.removeItem("guidance-counselor-transcript")
  }, [])

  const value = useMemo(
    () => ({
      transcriptAnalysis,
      setTranscriptAnalysis,
      updateTranscriptAnalysis,
      clearTranscriptAnalysis,
    }),
    [
      transcriptAnalysis,
      setTranscriptAnalysis,
      updateTranscriptAnalysis,
      clearTranscriptAnalysis,
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
