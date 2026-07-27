// @vitest-environment jsdom

import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { createTranscriptCourse } from "@/tests/factories/transcript-course.factory"
import type { GeneratePlanOptions } from "@/types/planner.type"
import type {
  TranscriptAnalysis,
  TranscriptCourse,
} from "@/types/transcript.type"
import TranscriptReviewPage from "@/app/(application)/transcript/review/page"

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  updateTranscriptAnalysis: vi.fn(),
  generatePlan: vi.fn(),
  useAcademicPlan: vi.fn(),
  useGenerateAcademicPlan: vi.fn(),
  createManualCourse: vi.fn(),
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mocks.push,
  }),
}))

vi.mock("@/components/providers/academic-plan-provider", () => ({
  useAcademicPlan: () => mocks.useAcademicPlan(),
}))

vi.mock("@/hooks/use-generate-academic-plan", () => ({
  useGenerateAcademicPlan: (argumentsValue: unknown) =>
    mocks.useGenerateAcademicPlan(argumentsValue),
}))

vi.mock("@/lib/transcript/create-transcript-course", () => ({
  createTranscriptCourse: () => mocks.createManualCourse(),
}))

vi.mock("@/components/layout/app-shell", () => ({
  AppShell: ({
    title,
    description,
    children,
  }: {
    title: string
    description: string
    children: React.ReactNode
  }) => (
    <main>
      <h1>{title}</h1>
      <p>{description}</p>
      {children}
    </main>
  ),
}))

vi.mock("@/components/transcript/transcript-review-summary", () => ({
  TranscriptReviewSummary: ({
    fileName,
    detectedCourseCount,
    includedCourseCount,
    earnedCredits,
    isGenerating,
    generationError,
    onGenerate,
  }: {
    fileName: string
    detectedCourseCount: number
    includedCourseCount: number
    earnedCredits: number
    isGenerating: boolean
    generationError: string
    onGenerate: () => void
  }) => (
    <section aria-label="Transcript summary">
      <span>{fileName}</span>

      <span>{detectedCourseCount} detected</span>

      <span>{includedCourseCount} included</span>

      <span>{earnedCredits} earned credits</span>

      {generationError ? <p role="alert">{generationError}</p> : null}

      <button type="button" disabled={isGenerating} onClick={onGenerate}>
        {isGenerating ? "Generating" : "Generate plan"}
      </button>
    </section>
  ),
}))

vi.mock("@/components/planner/planning-preferences", () => ({
  PlanningPreferences: ({
    value,
    onChange,
    disabled,
  }: {
    value: GeneratePlanOptions
    onChange: (options: GeneratePlanOptions) => void
    disabled: boolean
  }) => (
    <section aria-label="Planning preferences">
      <span data-testid="start-term">{value.startTerm}</span>

      <span data-testid="start-year">{value.startYear}</span>

      <button
        type="button"
        disabled={disabled}
        onClick={() =>
          onChange({
            ...value,
            startTerm: "spring",
            startYear: 2030,
            includeSummer: false,
          })
        }>
        Change preferences
      </button>
    </section>
  ),
}))

vi.mock("@/components/transcript/transcript-warnings", () => ({
  TranscriptWarnings: ({ warnings }: { warnings: string[] }) => (
    <section aria-label="Transcript warnings">
      {warnings.map((warning) => (
        <p key={warning}>{warning}</p>
      ))}
    </section>
  ),
}))

vi.mock("@/components/transcript/transcript-course-card", () => ({
  TranscriptCourseCard: ({
    course,
    onUpdate,
    onRemove,
  }: {
    course: TranscriptCourse
    onUpdate: (courseId: string, updates: Partial<TranscriptCourse>) => void
    onRemove: (courseId: string) => void
  }) => (
    <article data-testid={`course-${course.id}`}>
      <span>{course.normalizedTitle}</span>

      <button
        type="button"
        onClick={() =>
          onUpdate(course.id, {
            credits: 4,
          })
        }>
        Update {course.id}
      </button>

      <button type="button" onClick={() => onRemove(course.id)}>
        Remove {course.id}
      </button>
    </article>
  ),
}))

function createAnalysis(
  overrides: Partial<TranscriptAnalysis> = {},
): TranscriptAnalysis {
  return {
    id: "analysis-1",
    fileName: "transcript.pdf",
    fileType: "pdf",
    educationLevel: "college",
    estimatedCreditsEarned: 3,
    warnings: ["One course required normalization."],
    analyzedAt: "2026-07-27T12:00:00.000Z",
    courses: [
      createTranscriptCourse({
        id: "extracted-course",
        title: "English Composition I",
        subjectArea: "english",
        credits: 3,
        completionStatus: "passed",
        includedInPlan: true,
        source: "extracted",
      }),
      createTranscriptCourse({
        id: "manual-course",
        title: "Attempted Algebra",
        subjectArea: "mathematics",
        credits: 3,
        completionStatus: "failed",
        includedInPlan: false,
        source: "manual",
      }),
    ],
    ...overrides,
  }
}

function createBlankManualCourse(): TranscriptCourse {
  return createTranscriptCourse({
    id: "new-manual-course",
    originalName: "",
    normalizedTitle: "",
    subjectArea: "general_elective",
    credits: 0,
    completionStatus: "passed",
    includedInPlan: true,
    confidence: 1,
    source: "manual",
  })
}

function renderPage(analysis: TranscriptAnalysis | null = createAnalysis()) {
  mocks.useAcademicPlan.mockReturnValue({
    transcriptAnalysis: analysis,
    updateTranscriptAnalysis: mocks.updateTranscriptAnalysis,
  })

  return render(<TranscriptReviewPage />)
}

describe("TranscriptReviewPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mocks.createManualCourse.mockReturnValue(createBlankManualCourse())

    mocks.useGenerateAcademicPlan.mockReturnValue({
      generatePlan: mocks.generatePlan,
      isGenerating: false,
      generationError: "",
    })
  })

  it("shows the upload empty state when no analysis exists", async () => {
    const user = userEvent.setup()

    renderPage(null)

    expect(screen.getByText("No transcript analysis found")).toBeInTheDocument()

    await user.click(
      screen.getByRole("button", {
        name: "Upload transcript",
      }),
    )

    expect(mocks.push).toHaveBeenCalledWith("/upload")
  })

  it("displays transcript totals and warnings", () => {
    renderPage()

    expect(screen.getByText("transcript.pdf")).toBeInTheDocument()

    expect(screen.getByText("2 detected")).toBeInTheDocument()

    expect(screen.getByText("1 included")).toBeInTheDocument()

    expect(screen.getByText("3 earned credits")).toBeInTheDocument()

    expect(
      screen.getByText("One course required normalization."),
    ).toBeInTheDocument()
  })

  it("separates manual and extracted courses", () => {
    renderPage()

    expect(
      screen.getByRole("heading", {
        name: "Added courses",
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole("heading", {
        name: "Transcript courses",
      }),
    ).toBeInTheDocument()

    expect(screen.getByTestId("course-manual-course")).toBeInTheDocument()

    expect(screen.getByTestId("course-extracted-course")).toBeInTheDocument()
  })

  it("adds a blank manual course before existing courses", async () => {
    const user = userEvent.setup()
    const analysis = createAnalysis()

    renderPage(analysis)

    await user.click(
      screen.getByRole("button", {
        name: "Add course",
      }),
    )

    expect(mocks.updateTranscriptAnalysis).toHaveBeenCalledOnce()

    const updatedAnalysis = mocks.updateTranscriptAnalysis.mock
      .calls[0][0] as TranscriptAnalysis

    expect(updatedAnalysis.courses[0]).toEqual(createBlankManualCourse())

    expect(updatedAnalysis.courses.slice(1)).toEqual(analysis.courses)

    expect(updatedAnalysis.estimatedCreditsEarned).toBe(3)
  })

  it("updates a course and recalculates included credits", async () => {
    const user = userEvent.setup()

    renderPage()

    await user.click(
      screen.getByRole("button", {
        name: "Update extracted-course",
      }),
    )

    const updatedAnalysis = mocks.updateTranscriptAnalysis.mock
      .calls[0][0] as TranscriptAnalysis

    const updatedCourse = updatedAnalysis.courses.find(
      (course) => course.id === "extracted-course",
    )

    expect(updatedCourse?.credits).toBe(4)

    expect(updatedAnalysis.estimatedCreditsEarned).toBe(4)
  })

  it("removes a course and recalculates included credits", async () => {
    const user = userEvent.setup()

    renderPage()

    await user.click(
      screen.getByRole("button", {
        name: "Remove extracted-course",
      }),
    )

    const updatedAnalysis = mocks.updateTranscriptAnalysis.mock
      .calls[0][0] as TranscriptAnalysis

    expect(updatedAnalysis.courses.map((course) => course.id)).toEqual([
      "manual-course",
    ])

    expect(updatedAnalysis.estimatedCreditsEarned).toBe(0)
  })

  it("shows the no-course state and adds the first course", async () => {
    const user = userEvent.setup()

    renderPage(
      createAnalysis({
        courses: [],
        estimatedCreditsEarned: 0,
      }),
    )

    expect(screen.getByText("No courses added yet")).toBeInTheDocument()

    await user.click(
      screen.getByRole("button", {
        name: "Add your first course",
      }),
    )

    const updatedAnalysis = mocks.updateTranscriptAnalysis.mock
      .calls[0][0] as TranscriptAnalysis

    expect(updatedAnalysis.courses).toEqual([createBlankManualCourse()])
  })

  it("passes the current analysis and default preferences to the generation hook", () => {
    const analysis = createAnalysis()

    renderPage(analysis)

    expect(mocks.useGenerateAcademicPlan).toHaveBeenCalledWith({
      analysis,
      options: expect.objectContaining({
        programId: "bachelor-computer-science",
        priorCredential: "none",
        startTerm: "fall",
        fallSpringCreditTarget: 12,
        summerCreditTarget: 6,
        includeSummer: true,
      }),
    })
  })

  it("passes updated preferences to the generation hook", async () => {
    const user = userEvent.setup()
    const analysis = createAnalysis()

    renderPage(analysis)

    await user.click(
      screen.getByRole("button", {
        name: "Change preferences",
      }),
    )

    expect(mocks.useGenerateAcademicPlan).toHaveBeenLastCalledWith({
      analysis,
      options: expect.objectContaining({
        startTerm: "spring",
        startYear: 2030,
        includeSummer: false,
      }),
    })
  })

  it("runs plan generation from the summary action", async () => {
    const user = userEvent.setup()

    renderPage()

    await user.click(
      screen.getByRole("button", {
        name: "Generate plan",
      }),
    )

    expect(mocks.generatePlan).toHaveBeenCalledOnce()
  })

  it("displays the generation error returned by the hook", () => {
    mocks.useGenerateAcademicPlan.mockReturnValue({
      generatePlan: mocks.generatePlan,
      isGenerating: false,
      generationError: "Academic plan generation failed.",
    })

    renderPage()

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Academic plan generation failed.",
    )
  })

  it("disables review actions while generation is running", () => {
    mocks.useGenerateAcademicPlan.mockReturnValue({
      generatePlan: mocks.generatePlan,
      isGenerating: true,
      generationError: "",
    })

    renderPage()

    expect(
      screen.getByRole("button", {
        name: "Generating",
      }),
    ).toBeDisabled()

    expect(
      screen.getByRole("button", {
        name: "Add course",
      }),
    ).toBeDisabled()

    expect(
      screen.getByRole("button", {
        name: "Change preferences",
      }),
    ).toBeDisabled()
  })
})
