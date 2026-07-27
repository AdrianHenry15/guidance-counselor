// @vitest-environment jsdom

import { act, renderHook, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useGenerateAcademicPlan } from "@/hooks/use-generate-academic-plan"
import { createTranscriptCourse } from "@/tests/factories/transcript-course.factory"
import type { StudentAcademicPlan } from "@/types/academic.type"
import type { GeneratePlanOptions } from "@/types/planner.type"
import type { TranscriptAnalysis } from "@/types/transcript.type"

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  setGeneratedPlan: vi.fn(),
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mocks.push,
  }),
}))

vi.mock("@/components/providers/academic-plan-provider", () => ({
  useAcademicPlan: () => ({
    setGeneratedPlan: mocks.setGeneratedPlan,
  }),
}))

const validOptions: GeneratePlanOptions = {
  programId: "bachelor-computer-science",
  priorCredential: "none",
  startTerm: "fall",
  startYear: new Date().getFullYear() + 1,
  fallSpringCreditTarget: 12,
  summerCreditTarget: 6,
  includeSummer: true,
}

function createAnalysis(
  courses = [
    createTranscriptCourse({
      id: "course-1",
      title: "English Composition I",
      subjectArea: "english",
      credits: 3,
      completionStatus: "passed",
      includedInPlan: true,
      source: "extracted",
    }),
  ],
): TranscriptAnalysis {
  return {
    id: "analysis-1",
    fileName: "transcript.pdf",
    fileType: "pdf",
    educationLevel: "college",
    estimatedCreditsEarned: 3,
    courses,
    warnings: [],
    analyzedAt: "2026-07-27T12:00:00.000Z",
  }
}

function createGeneratedPlan(): StudentAcademicPlan {
  return {
    id: "plan-1",
  } as StudentAcademicPlan
}

describe("useGenerateAcademicPlan", () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal("fetch", fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("blocks generation when no passed course is included", async () => {
    const analysis = createAnalysis([
      createTranscriptCourse({
        id: "failed-course",
        completionStatus: "failed",
        includedInPlan: false,
      }),
      createTranscriptCourse({
        id: "excluded-course",
        completionStatus: "passed",
        includedInPlan: false,
      }),
    ])

    const { result } = renderHook(() =>
      useGenerateAcademicPlan({
        analysis,
        options: validOptions,
      }),
    )

    await act(async () => {
      await result.current.generatePlan()
    })

    expect(result.current.generationError).toBe(
      "Include at least one passed course before generating your plan.",
    )

    expect(fetchMock).not.toHaveBeenCalled()
    expect(mocks.setGeneratedPlan).not.toHaveBeenCalled()
    expect(mocks.push).not.toHaveBeenCalled()
  })

  it("blocks generation when an included course has a blank title", async () => {
    const analysis = createAnalysis([
      createTranscriptCourse({
        id: "blank-course",
        normalizedTitle: "   ",
        credits: 3,
        completionStatus: "passed",
        includedInPlan: true,
      }),
    ])

    const { result } = renderHook(() =>
      useGenerateAcademicPlan({
        analysis,
        options: validOptions,
      }),
    )

    await act(async () => {
      await result.current.generatePlan()
    })

    expect(result.current.generationError).toBe(
      "Every included course must have a title and a credit value greater than zero.",
    )

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("blocks generation when an included course has zero credits", async () => {
    const analysis = createAnalysis([
      createTranscriptCourse({
        id: "zero-credit-course",
        normalizedTitle: "Calculus I",
        credits: 0,
        completionStatus: "passed",
        includedInPlan: true,
      }),
    ])

    const { result } = renderHook(() =>
      useGenerateAcademicPlan({
        analysis,
        options: validOptions,
      }),
    )

    await act(async () => {
      await result.current.generatePlan()
    })

    expect(result.current.generationError).toBe(
      "Every included course must have a title and a credit value greater than zero.",
    )

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("submits the reviewed transcript and planning options", async () => {
    const analysis = createAnalysis()
    const generatedPlan = createGeneratedPlan()

    fetchMock.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        success: true,
        plan: generatedPlan,
      }),
    })

    const { result } = renderHook(() =>
      useGenerateAcademicPlan({
        analysis,
        options: validOptions,
      }),
    )

    await act(async () => {
      await result.current.generatePlan()
    })

    expect(fetchMock).toHaveBeenCalledOnce()

    expect(fetchMock).toHaveBeenCalledWith("/api/planner/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transcriptCourses: analysis.courses,
        options: validOptions,
      }),
    })
  })

  it("stores the generated plan and navigates to the results page", async () => {
    const generatedPlan = createGeneratedPlan()

    fetchMock.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        success: true,
        plan: generatedPlan,
      }),
    })

    const { result } = renderHook(() =>
      useGenerateAcademicPlan({
        analysis: createAnalysis(),
        options: validOptions,
      }),
    )

    await act(async () => {
      await result.current.generatePlan()
    })

    expect(mocks.setGeneratedPlan).toHaveBeenCalledOnce()

    expect(mocks.setGeneratedPlan).toHaveBeenCalledWith(generatedPlan)

    expect(mocks.push).toHaveBeenCalledWith("/planner/generated")

    expect(result.current.generationError).toBe("")

    expect(result.current.isGenerating).toBe(false)
  })

  it("displays an API validation error without storing a plan", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({
        success: false,
        error: "The selected program is unavailable.",
      }),
    })

    const { result } = renderHook(() =>
      useGenerateAcademicPlan({
        analysis: createAnalysis(),
        options: validOptions,
      }),
    )

    await act(async () => {
      await result.current.generatePlan()
    })

    expect(result.current.generationError).toBe(
      "The selected program is unavailable.",
    )

    expect(mocks.setGeneratedPlan).not.toHaveBeenCalled()

    expect(mocks.push).not.toHaveBeenCalled()
    expect(result.current.isGenerating).toBe(false)
  })

  it("uses a fallback error when the API response is unsuccessful without a message", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({
        success: false,
      }),
    })

    const { result } = renderHook(() =>
      useGenerateAcademicPlan({
        analysis: createAnalysis(),
        options: validOptions,
      }),
    )

    await act(async () => {
      await result.current.generatePlan()
    })

    expect(result.current.generationError).toBe(
      "Academic plan generation failed.",
    )
  })

  it("handles network failures", async () => {
    fetchMock.mockRejectedValue(new Error("Network unavailable"))

    const { result } = renderHook(() =>
      useGenerateAcademicPlan({
        analysis: createAnalysis(),
        options: validOptions,
      }),
    )

    await act(async () => {
      await result.current.generatePlan()
    })

    expect(result.current.generationError).toBe("Network unavailable")

    expect(result.current.isGenerating).toBe(false)

    expect(mocks.setGeneratedPlan).not.toHaveBeenCalled()

    expect(mocks.push).not.toHaveBeenCalled()
  })

  it("reports loading state while the request is pending", async () => {
    let resolveRequest: ((value: unknown) => void) | undefined

    fetchMock.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve
      }),
    )

    const { result } = renderHook(() =>
      useGenerateAcademicPlan({
        analysis: createAnalysis(),
        options: validOptions,
      }),
    )

    let requestPromise: Promise<void> | undefined

    act(() => {
      requestPromise = result.current.generatePlan()
    })

    await waitFor(() => {
      expect(result.current.isGenerating).toBe(true)
    })

    await act(async () => {
      resolveRequest?.({
        ok: true,
        json: vi.fn().mockResolvedValue({
          success: true,
          plan: createGeneratedPlan(),
        }),
      })

      await requestPromise
    })

    expect(result.current.isGenerating).toBe(false)
  })
})
