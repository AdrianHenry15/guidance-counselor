// @vitest-environment jsdom

import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { DegreeAuditSummary } from "@/components/planner/degree-audit-summary"
import type {
  DegreeAudit,
  DegreeRequirementProgress,
} from "@/types/degree-audit.type"

function createRequirement(
  overrides: Partial<DegreeRequirementProgress> = {},
): DegreeRequirementProgress {
  return {
    requirementId: "college-writing",
    title: "College Writing",
    description: "Foundational written communication coursework.",
    requiredCredits: 6,
    appliedCredits: 6,
    remainingCredits: 0,
    completionPercentage: 100,
    status: "complete",
    ...overrides,
  }
}

function createAudit(overrides: Partial<DegreeAudit> = {}): DegreeAudit {
  return {
    programId: "bachelor-computer-science",
    programName: "Bachelor's Degree in Computer Science",
    totalRequiredCredits: 120,
    totalAppliedCredits: 30,
    totalRemainingCredits: 90,
    completionPercentage: 25,
    requirements: [
      createRequirement(),
      createRequirement({
        requirementId: "mathematics-foundation",
        title: "Mathematics Foundation",
        description: "Calculus and supporting mathematics.",
        requiredCredits: 15,
        appliedCredits: 6,
        remainingCredits: 9,
        completionPercentage: 40,
        status: "in_progress",
      }),
      createRequirement({
        requirementId: "laboratory-science",
        title: "Laboratory Science",
        description: "College-level laboratory science.",
        requiredCredits: 8,
        appliedCredits: 0,
        remainingCredits: 8,
        completionPercentage: 0,
        status: "not_started",
      }),
    ],
    ...overrides,
  }
}

describe("DegreeAuditSummary", () => {
  it("displays overall degree progress", () => {
    render(<DegreeAuditSummary audit={createAudit()} />)

    expect(
      screen.getByRole("heading", {
        name: "Degree audit",
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByText("30 of 120 required credits applied"),
    ).toBeInTheDocument()

    expect(screen.getAllByText("25%")).toHaveLength(2)
  })

  it("configures the overall progress bar with applied and required credits", () => {
    render(<DegreeAuditSummary audit={createAudit()} />)

    const progressBars = screen.getAllByRole("progressbar")

    expect(progressBars[0]).toHaveAttribute("aria-valuenow", "30")

    expect(progressBars[0]).toHaveAttribute("aria-valuemin", "0")

    expect(progressBars[0]).toHaveAttribute("aria-valuemax", "120")
  })

  it("renders every degree requirement", () => {
    render(<DegreeAuditSummary audit={createAudit()} />)

    expect(screen.getByText("College Writing")).toBeInTheDocument()

    expect(screen.getByText("Mathematics Foundation")).toBeInTheDocument()

    expect(screen.getByText("Laboratory Science")).toBeInTheDocument()
  })

  it("displays requirement descriptions and credit totals", () => {
    render(<DegreeAuditSummary audit={createAudit()} />)

    expect(
      screen.getByText("Foundational written communication coursework."),
    ).toBeInTheDocument()

    expect(screen.getByText("6 / 6 credits")).toBeInTheDocument()

    expect(screen.getByText("6 / 15 credits")).toBeInTheDocument()

    expect(screen.getByText("0 / 8 credits")).toBeInTheDocument()
  })

  it("configures one progress bar for each requirement", () => {
    render(<DegreeAuditSummary audit={createAudit()} />)

    const progressBars = screen.getAllByRole("progressbar")

    expect(progressBars).toHaveLength(4)

    expect(progressBars[1]).toHaveAttribute("aria-valuenow", "6")

    expect(progressBars[1]).toHaveAttribute("aria-valuemax", "6")

    expect(progressBars[2]).toHaveAttribute("aria-valuenow", "6")

    expect(progressBars[2]).toHaveAttribute("aria-valuemax", "15")

    expect(progressBars[3]).toHaveAttribute("aria-valuenow", "0")

    expect(progressBars[3]).toHaveAttribute("aria-valuemax", "8")
  })

  it("displays calculated requirement percentages", () => {
    render(<DegreeAuditSummary audit={createAudit()} />)

    expect(screen.getByText("100%")).toBeInTheDocument()

    expect(screen.getByText("40%")).toBeInTheDocument()

    expect(screen.getByText("0%")).toBeInTheDocument()
  })

  it("renders only the overall progress bar when there are no requirements", () => {
    render(
      <DegreeAuditSummary
        audit={createAudit({
          requirements: [],
        })}
      />,
    )

    expect(screen.getAllByRole("progressbar")).toHaveLength(1)

    expect(screen.queryByText("College Writing")).not.toBeInTheDocument()
  })
})
