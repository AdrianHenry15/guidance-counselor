// @vitest-environment jsdom

import type { ReactNode } from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import type { StudentAcademicPlan } from "@/types/academic.type"
import GeneratedPlanPage from "@/app/(application)/planner/generated/page"

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  updateGeneratedPlan: vi.fn(),
  resetGeneratedPlan: vi.fn(),
  useAcademicPlan: vi.fn(),
  moveCourseInPlan: vi.fn(),
  hasPlanEdits: vi.fn(),
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mocks.push,
  }),
}))

vi.mock("@/components/providers/academic-plan-provider", () => ({
  useAcademicPlan: () => mocks.useAcademicPlan(),
}))

vi.mock("@/lib/planner/edit-academic-plan", () => ({
  moveCourseInPlan: (argumentsValue: unknown) =>
    mocks.moveCourseInPlan(argumentsValue),
}))

vi.mock("@/lib/planner/has-plan-edits", () => ({
  hasPlanEdits: (
    activePlan: StudentAcademicPlan,
    originalPlan: StudentAcademicPlan,
  ) => mocks.hasPlanEdits(activePlan, originalPlan),
}))

vi.mock("@/components/layout/app-shell", () => ({
  AppShell: ({
    title,
    description,
    children,
  }: {
    title: string
    description: string
    children: ReactNode
  }) => (
    <main>
      <h1>{title}</h1>
      <p>{description}</p>
      {children}
    </main>
  ),
}))

vi.mock("@/components/planner/semester-card", () => ({
  SemesterCard: ({
    semester,
    semesterIndex,
    semesterCount,
    validationIssues,
    editable,
    onMoveCourse,
  }: {
    semester: {
      id: string
      label: string
    }
    semesterIndex?: number
    semesterCount?: number
    validationIssues?: unknown[]
    editable?: boolean
    onMoveCourse?: (courseId: string, direction: "earlier" | "later") => void
  }) => (
    <section data-testid={`semester-${semester.id}`}>
      <h2>{semester.label}</h2>

      <span>
        Index {semesterIndex} of {semesterCount}
      </span>

      <span data-testid={`issues-${semester.id}`}>
        {validationIssues?.length ?? 0}
      </span>

      <span>{editable ? "Editable" : "Read only"}</span>

      <button
        type="button"
        onClick={() => onMoveCourse?.("course-1", "earlier")}>
        Move earlier from {semester.label}
      </button>

      <button type="button" onClick={() => onMoveCourse?.("course-1", "later")}>
        Move later from {semester.label}
      </button>
    </section>
  ),
}))

vi.mock("@/components/planner/degree-audit-summary", () => ({
  DegreeAuditSummary: ({
    audit,
  }: {
    audit: {
      totalAppliedCredits: number
    }
  }) => (
    <section aria-label="Degree audit">
      {audit.totalAppliedCredits} audit credits
    </section>
  ),
}))

vi.mock("@/components/planner/credit-allocation-summary", () => ({
  CreditAllocationSummary: ({ allocations }: { allocations: unknown[] }) => (
    <section aria-label="Credit allocations">
      {allocations.length} allocations
    </section>
  ),
}))

vi.mock("@/components/planner/plan-validation-summary", () => ({
  PlanValidationSummary: ({
    validation,
  }: {
    validation: {
      isValid: boolean
    }
  }) => (
    <section aria-label="Plan validation">
      {validation.isValid ? "Valid plan" : "Invalid plan"}
    </section>
  ),
}))

vi.mock("@/components/planner/prior-credential-advisory", () => ({
  PriorCredentialAdvisory: ({ credential }: { credential: string }) => (
    <section aria-label="Credential advisory">{credential}</section>
  ),
}))

function createPlan(
  overrides: Partial<StudentAcademicPlan> = {},
): StudentAcademicPlan {
  return {
    id: "plan-1",
    studentId: "student-1",
    programId: "bachelor-computer-science",
    programName: "Bachelor's Degree in Computer Science",
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
      {
        id: "spring-2028",
        label: "Spring 2028",
        term: "spring",
        year: 2028,
        creditTarget: 12,
        courses: [],
      },
    ],

    completedCourseIds: ["completed-course-1"],
    completedCredits: 24,
    appliedCredits: 18,
    totalPlannedCredits: 102,

    transcriptAllocations: [],

    degreeAudit: {
      programId: "bachelor-computer-science",
      programName: "Bachelor's Degree in Computer Science",
      totalRequiredCredits: 120,
      totalAppliedCredits: 18,
      totalRemainingCredits: 102,
      completionPercentage: 15,
      requirements: [],
    },

    estimatedGraduation: "Spring 2031",

    generatedAt: "2026-07-27T12:00:00.000Z",

    validation: {
      isValid: true,
      issues: [],
      errorCount: 0,
      warningCount: 0,
    },

    ...overrides,
  }
}

function configureContext({
  generatedPlan = createPlan(),
  originalGeneratedPlan = generatedPlan,
  transcriptAnalysis = {
    id: "analysis-1",
  },
}: {
  generatedPlan?: StudentAcademicPlan | null
  originalGeneratedPlan?: StudentAcademicPlan | null
  transcriptAnalysis?: object | null
} = {}) {
  mocks.useAcademicPlan.mockReturnValue({
    generatedPlan,
    originalGeneratedPlan,
    transcriptAnalysis,
    updateGeneratedPlan: mocks.updateGeneratedPlan,
    resetGeneratedPlan: mocks.resetGeneratedPlan,
  })
}

describe("GeneratedPlanPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mocks.hasPlanEdits.mockReturnValue(false)

    configureContext()
  })

  it("returns to transcript review when a transcript exists but no plan exists", async () => {
    const user = userEvent.setup()

    configureContext({
      generatedPlan: null,
      originalGeneratedPlan: null,
      transcriptAnalysis: {
        id: "analysis-1",
      },
    })

    render(<GeneratedPlanPage />)

    expect(screen.getByText("No generated plan found")).toBeInTheDocument()

    await user.click(
      screen.getByRole("button", {
        name: "Return to transcript",
      }),
    )

    expect(mocks.push).toHaveBeenCalledWith("/transcript/review")
  })

  it("returns to upload when neither a plan nor transcript exists", async () => {
    const user = userEvent.setup()

    configureContext({
      generatedPlan: null,
      originalGeneratedPlan: null,
      transcriptAnalysis: null,
    })

    render(<GeneratedPlanPage />)

    await user.click(
      screen.getByRole("button", {
        name: "Upload transcript",
      }),
    )

    expect(mocks.push).toHaveBeenCalledWith("/upload")
  })

  it("displays the generated-plan overview", () => {
    render(<GeneratedPlanPage />)

    expect(
      screen.getByText("Bachelor's Degree in Computer Science"),
    ).toBeInTheDocument()

    expect(
      screen.getByText(
        "24 credits earned · 18 applied to this degree · 102 remaining",
      ),
    ).toBeInTheDocument()

    expect(
      screen.getByText("120 total degree credits mapped"),
    ).toBeInTheDocument()

    expect(screen.getByText("Spring 2031")).toBeInTheDocument()
  })

  it("renders audit, allocation, validation, and credential summaries", () => {
    render(<GeneratedPlanPage />)

    expect(
      screen.getByRole("region", {
        name: "Degree audit",
      }),
    ).toHaveTextContent("18 audit credits")

    expect(
      screen.getByRole("region", {
        name: "Credit allocations",
      }),
    ).toHaveTextContent("0 allocations")

    expect(
      screen.getByRole("region", {
        name: "Plan validation",
      }),
    ).toHaveTextContent("Valid plan")

    expect(
      screen.getByRole("region", {
        name: "Credential advisory",
      }),
    ).toHaveTextContent("none")
  })

  it("renders semesters with their index, count, and validation issues", () => {
    const plan = createPlan({
      validation: {
        isValid: false,
        errorCount: 1,
        warningCount: 1,
        issues: [
          {
            id: "fall-issue",
            severity: "error",
            type: "credit_overload",
            message: "Fall credit overload",
            semesterId: "fall-2027",
          },
          {
            id: "spring-issue",
            severity: "warning",
            type: "prerequisite_order",
            message: "Spring prerequisite warning",
            semesterId: "spring-2028",
          },
        ],
      },
    })

    configureContext({
      generatedPlan: plan,
      originalGeneratedPlan: plan,
    })

    render(<GeneratedPlanPage />)

    expect(screen.getByTestId("semester-fall-2027")).toHaveTextContent(
      "Index 0 of 2",
    )

    expect(screen.getByTestId("semester-spring-2028")).toHaveTextContent(
      "Index 1 of 2",
    )

    expect(screen.getByTestId("issues-fall-2027")).toHaveTextContent("1")

    expect(screen.getByTestId("issues-spring-2028")).toHaveTextContent("1")
  })

  it("keeps reset disabled for the original generated plan", () => {
    mocks.hasPlanEdits.mockReturnValue(false)

    render(<GeneratedPlanPage />)

    expect(
      screen.getByRole("button", {
        name: "Reset plan",
      }),
    ).toBeDisabled()

    expect(
      screen.getByText(
        "This is the original schedule generated by the planner.",
      ),
    ).toBeInTheDocument()
  })

  it("resets an edited plan", async () => {
    const user = userEvent.setup()

    mocks.hasPlanEdits.mockReturnValue(true)

    render(<GeneratedPlanPage />)

    expect(
      screen.getByText("This plan includes manual semester changes."),
    ).toBeInTheDocument()

    const resetButton = screen.getByRole("button", {
      name: "Reset plan",
    })

    expect(resetButton).toBeEnabled()

    await user.click(resetButton)

    expect(mocks.resetGeneratedPlan).toHaveBeenCalledOnce()
  })

  it("navigates back to transcript editing", async () => {
    const user = userEvent.setup()

    render(<GeneratedPlanPage />)

    await user.click(
      screen.getByRole("button", {
        name: "Edit transcript",
      }),
    )

    expect(mocks.push).toHaveBeenCalledWith("/transcript/review")
  })

  it("moves a course into the next semester", async () => {
    const user = userEvent.setup()

    const plan = createPlan()

    const movedPlan = createPlan({
      id: "moved-plan",
    })

    configureContext({
      generatedPlan: plan,
      originalGeneratedPlan: plan,
    })

    mocks.moveCourseInPlan.mockReturnValue(movedPlan)

    render(<GeneratedPlanPage />)

    await user.click(
      screen.getByRole("button", {
        name: "Move later from Fall 2027",
      }),
    )

    expect(mocks.moveCourseInPlan).toHaveBeenCalledWith({
      plan,
      courseId: "course-1",
      sourceSemesterId: "fall-2027",
      targetSemesterId: "spring-2028",
    })

    expect(mocks.updateGeneratedPlan).toHaveBeenCalledWith(movedPlan)

    expect(
      screen.getByText("Spring 2028 now includes the moved course."),
    ).toBeInTheDocument()
  })

  it("does not move beyond the first or last semester", async () => {
    const user = userEvent.setup()

    render(<GeneratedPlanPage />)

    await user.click(
      screen.getByRole("button", {
        name: "Move earlier from Fall 2027",
      }),
    )

    await user.click(
      screen.getByRole("button", {
        name: "Move later from Spring 2028",
      }),
    )

    expect(mocks.moveCourseInPlan).not.toHaveBeenCalled()

    expect(mocks.updateGeneratedPlan).not.toHaveBeenCalled()
  })

  it("displays an editing error when a move is rejected", async () => {
    const user = userEvent.setup()

    mocks.moveCourseInPlan.mockImplementation(() => {
      throw new Error("The move violates prerequisite order.")
    })

    render(<GeneratedPlanPage />)

    await user.click(
      screen.getByRole("button", {
        name: "Move later from Fall 2027",
      }),
    )

    expect(screen.getByRole("alert")).toHaveTextContent(
      "The move violates prerequisite order.",
    )

    expect(mocks.updateGeneratedPlan).not.toHaveBeenCalled()
  })
})
