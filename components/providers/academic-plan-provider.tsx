"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

import type { StudentAcademicPlan } from "@/types/academic.type"
import type { TranscriptAnalysis } from "@/types/transcript.type"

interface AcademicPlanContextValue {
  transcriptAnalysis: TranscriptAnalysis | null
  generatedPlan: StudentAcademicPlan | null
  isHydrated: boolean

  setTranscriptAnalysis: (analysis: TranscriptAnalysis) => void

  updateTranscriptAnalysis: (analysis: TranscriptAnalysis) => void

  setGeneratedPlan: (plan: StudentAcademicPlan) => void

  clearTranscriptAnalysis: () => void
  clearGeneratedPlan: () => void
}

const AcademicPlanContext = createContext<AcademicPlanContextValue | null>(null)

const transcriptStorageKey = "guidance-counselor-transcript"

const planStorageKey = "guidance-counselor-plan"

function readStoredValue<T>(key: string): T | null {
  const storedValue = window.localStorage.getItem(key)

  if (!storedValue) {
    return null
  }

  try {
    return JSON.parse(storedValue) as T
  } catch {
    window.localStorage.removeItem(key)
    return null
  }
}

export function AcademicPlanProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [transcriptAnalysis, setAnalysis] = useState<TranscriptAnalysis | null>(
    null,
  )

  const [generatedPlan, setPlan] = useState<StudentAcademicPlan | null>(null)

  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const storedTranscript =
        readStoredValue<TranscriptAnalysis>(transcriptStorageKey)

      const storedPlan = readStoredValue<StudentAcademicPlan>(planStorageKey)

      setAnalysis(storedTranscript)
      setPlan(storedPlan)
      setIsHydrated(true)
    }, 0)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [])

  const setTranscriptAnalysis = useCallback((analysis: TranscriptAnalysis) => {
    setAnalysis(analysis)

    window.localStorage.setItem(transcriptStorageKey, JSON.stringify(analysis))
  }, [])

  const updateTranscriptAnalysis = useCallback(
    (analysis: TranscriptAnalysis) => {
      setAnalysis(analysis)

      window.localStorage.setItem(
        transcriptStorageKey,
        JSON.stringify(analysis),
      )
    },
    [],
  )

  const setGeneratedPlan = useCallback((plan: StudentAcademicPlan) => {
    setPlan(plan)

    window.localStorage.setItem(planStorageKey, JSON.stringify(plan))
  }, [])

  const clearTranscriptAnalysis = useCallback(() => {
    setAnalysis(null)

    window.localStorage.removeItem(transcriptStorageKey)
  }, [])

  const clearGeneratedPlan = useCallback(() => {
    setPlan(null)

    window.localStorage.removeItem(planStorageKey)
  }, [])

  const value = useMemo(
    () => ({
      transcriptAnalysis,
      generatedPlan,
      isHydrated,
      setTranscriptAnalysis,
      updateTranscriptAnalysis,
      setGeneratedPlan,
      clearTranscriptAnalysis,
      clearGeneratedPlan,
    }),
    [
      transcriptAnalysis,
      generatedPlan,
      isHydrated,
      setTranscriptAnalysis,
      updateTranscriptAnalysis,
      setGeneratedPlan,
      clearTranscriptAnalysis,
      clearGeneratedPlan,
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
