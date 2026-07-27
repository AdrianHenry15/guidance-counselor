// @vitest-environment jsdom

import type { ReactNode } from "react"
import { act, renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { createTranscriptCourse } from "@/tests/factories/transcript-course.factory"
import type { StudentAcademicPlan } from "@/types/academic.type"
import type { TranscriptAnalysis } from "@/types/transcript.type"
import {
  AcademicPlanProvider,
  useAcademicPlan,
} from "@/components/providers/academic-plan-provider"

/**
 * Wraps tested hooks in the academic-plan provider.
 */
function wrapper({ children }: { children: ReactNode }) {
  return <AcademicPlanProvider>{children}</AcademicPlanProvider>
}

/**
 * Creates a predictable transcript analysis for context tests.
 */
function createTranscriptAnalysis(
  overrides: Partial<TranscriptAnalysis> = {},
): TranscriptAnalysis {
  return {
    id: "analysis-1",
    fileName: "transcript.pdf",
    fileType: "pdf",
    educationLevel: "college",
    estimatedCreditsEarned: 3,
    courses: [
      createTranscriptCourse({
        id: "course-1",
        title: "English Composition I",
        subjectArea: "english",
        credits: 3,
      }),
    ],
    warnings: [],
    analyzedAt: "2026-07-27T12:00:00.000Z",
    ...overrides,
  }
}

/**
 * Creates a predictable generated plan for context tests.
 */
function createAcademicPlan(
  overrides: Partial<StudentAcademicPlan> = {},
): StudentAcademicPlan {
  return {
    id: "plan-1",
    studentId: "student-1",
    programId: "bachelor-computer-science",
    programName: "Bachelor’s in Computer Science",
    priorCredential: "none",
    educationLevel: "college",
    semesters: [
      {
        id: "fall-2027",
        label: "Fall 2027",
        term: "fall",
        year: 2027,
        creditTarget: 12,
        courses: [],
      },
    ],
    completedCourseIds: ["course-1"],
    completedCredits: 3,
    appliedCredits: 3,
    totalPlannedCredits: 117,
    transcriptAllocations: [],
    degreeAudit: {
      programId: "bachelor-computer-science",
      programName: "Bachelor’s in Computer Science",
      totalRequiredCredits: 120,
      totalAppliedCredits: 3,
      totalRemainingCredits: 117,
      completionPercentage: 2.5,
      requirements: [],
    },
    estimatedGraduation: "Spring 2031",
    generatedAt: "2026-07-27T12:05:00.000Z",
    validation: {
      isValid: true,
      issues: [],
      errorCount: 0,
      warningCount: 0,
    },
    ...overrides,
  }
}

describe("AcademicPlanProvider", () => {
  it("starts with empty planning state", () => {
    const { result } = renderHook(() => useAcademicPlan(), {
      wrapper,
    })

    expect(result.current.transcriptAnalysis).toBeNull()

    expect(result.current.generatedPlan).toBeNull()

    expect(result.current.originalGeneratedPlan).toBeNull()
  })

  it("stores a transcript analysis", () => {
    const analysis = createTranscriptAnalysis()

    const { result } = renderHook(() => useAcademicPlan(), {
      wrapper,
    })

    act(() => {
      result.current.setTranscriptAnalysis(analysis)
    })

    expect(result.current.transcriptAnalysis).toEqual(analysis)
  })

  it("stores a generated plan as both the active and original plan", () => {
    const plan = createAcademicPlan()

    const { result } = renderHook(() => useAcademicPlan(), {
      wrapper,
    })

    act(() => {
      result.current.setGeneratedPlan(plan)
    })

    expect(result.current.generatedPlan).toEqual(plan)

    expect(result.current.originalGeneratedPlan).toEqual(plan)
  })

  it("updates only the active generated plan", () => {
    const originalPlan = createAcademicPlan()

    const editedPlan = createAcademicPlan({
      programName: "Edited Computer Science Plan",
    })

    const { result } = renderHook(() => useAcademicPlan(), {
      wrapper,
    })

    act(() => {
      result.current.setGeneratedPlan(originalPlan)
    })

    act(() => {
      result.current.updateGeneratedPlan(editedPlan)
    })

    expect(result.current.generatedPlan).toEqual(editedPlan)

    expect(result.current.originalGeneratedPlan).toEqual(originalPlan)
  })

  it("restores the original generated plan after edits", () => {
    const originalPlan = createAcademicPlan()

    const editedPlan = createAcademicPlan({
      semesters: [
        {
          id: "spring-2028",
          label: "Spring 2028",
          term: "spring",
          year: 2028,
          creditTarget: 12,
          courses: [],
        },
      ],
    })

    const { result } = renderHook(() => useAcademicPlan(), {
      wrapper,
    })

    act(() => {
      result.current.setGeneratedPlan(originalPlan)

      result.current.updateGeneratedPlan(editedPlan)
    })

    expect(result.current.generatedPlan).toEqual(editedPlan)

    act(() => {
      result.current.resetGeneratedPlan()
    })

    expect(result.current.generatedPlan).toEqual(originalPlan)

    expect(result.current.originalGeneratedPlan).toEqual(originalPlan)
  })

  it("clears existing plans when a new transcript is stored", () => {
    const originalAnalysis = createTranscriptAnalysis()

    const replacementAnalysis = createTranscriptAnalysis({
      id: "analysis-2",
      fileName: "replacement-transcript.pdf",
    })

    const plan = createAcademicPlan()

    const { result } = renderHook(() => useAcademicPlan(), {
      wrapper,
    })

    act(() => {
      result.current.setTranscriptAnalysis(originalAnalysis)

      result.current.setGeneratedPlan(plan)
    })

    act(() => {
      result.current.setTranscriptAnalysis(replacementAnalysis)
    })

    expect(result.current.transcriptAnalysis).toEqual(replacementAnalysis)

    expect(result.current.generatedPlan).toBeNull()

    expect(result.current.originalGeneratedPlan).toBeNull()
  })

  it("clears existing plans when transcript edits are stored", () => {
    const originalAnalysis = createTranscriptAnalysis()

    const editedAnalysis = createTranscriptAnalysis({
      courses: [
        createTranscriptCourse({
          id: "course-1",
          title: "Edited English Composition I",
          subjectArea: "english",
        }),
      ],
    })

    const plan = createAcademicPlan()

    const { result } = renderHook(() => useAcademicPlan(), {
      wrapper,
    })

    act(() => {
      result.current.setTranscriptAnalysis(originalAnalysis)

      result.current.setGeneratedPlan(plan)
    })

    act(() => {
      result.current.updateTranscriptAnalysis(editedAnalysis)
    })

    expect(result.current.transcriptAnalysis).toEqual(editedAnalysis)

    expect(result.current.generatedPlan).toBeNull()

    expect(result.current.originalGeneratedPlan).toBeNull()
  })

  it("clears generated plans while preserving the transcript", () => {
    const analysis = createTranscriptAnalysis()

    const plan = createAcademicPlan()

    const { result } = renderHook(() => useAcademicPlan(), {
      wrapper,
    })

    act(() => {
      result.current.setTranscriptAnalysis(analysis)

      result.current.setGeneratedPlan(plan)
    })

    act(() => {
      result.current.clearGeneratedPlan()
    })

    expect(result.current.transcriptAnalysis).toEqual(analysis)

    expect(result.current.generatedPlan).toBeNull()

    expect(result.current.originalGeneratedPlan).toBeNull()
  })

  it("clears the transcript and all generated plans", () => {
    const analysis = createTranscriptAnalysis()

    const plan = createAcademicPlan()

    const { result } = renderHook(() => useAcademicPlan(), {
      wrapper,
    })

    act(() => {
      result.current.setTranscriptAnalysis(analysis)

      result.current.setGeneratedPlan(plan)
    })

    act(() => {
      result.current.clearTranscriptAnalysis()
    })

    expect(result.current.transcriptAnalysis).toBeNull()

    expect(result.current.generatedPlan).toBeNull()

    expect(result.current.originalGeneratedPlan).toBeNull()
  })

  it("clears the entire academic planning workflow", () => {
    const analysis = createTranscriptAnalysis()

    const plan = createAcademicPlan()

    const { result } = renderHook(() => useAcademicPlan(), {
      wrapper,
    })

    act(() => {
      result.current.setTranscriptAnalysis(analysis)

      result.current.setGeneratedPlan(plan)
    })

    act(() => {
      result.current.clearAcademicPlan()
    })

    expect(result.current.transcriptAnalysis).toBeNull()

    expect(result.current.generatedPlan).toBeNull()

    expect(result.current.originalGeneratedPlan).toBeNull()
  })

  it("throws when used outside AcademicPlanProvider", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})

    expect(() => renderHook(() => useAcademicPlan())).toThrow(
      "useAcademicPlan must be used within AcademicPlanProvider",
    )

    consoleError.mockRestore()
  })
})
