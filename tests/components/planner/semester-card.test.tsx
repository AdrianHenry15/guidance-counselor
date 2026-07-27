// @vitest-environment jsdom

import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { SemesterCard } from "@/components/planner/semester-card"
import type { PlannedCourse, PlannedSemester } from "@/types/academic.type"
import type { PlanValidationIssue } from "@/types/plan-validation.type"

function createCourse(overrides: Partial<PlannedCourse> = {}): PlannedCourse {
  return {
    id: "course-1",
    title: "Calculus I",
    description: "Limits, derivatives, integrals, and applications.",
    subjectArea: "mathematics",
    credits: 3,
    level: "college",
    difficulty: "intermediate",
    prerequisites: [],
    status: "planned",
    source: "degree_requirement",
    ...overrides,
  }
}

function createSemester(
  overrides: Partial<PlannedSemester> = {},
): PlannedSemester {
  return {
    id: "fall-2027",
    label: "Fall 2027",
    term: "fall",
    year: 2027,
    creditTarget: 12,
    courses: [createCourse()],
    ...overrides,
  }
}

describe("SemesterCard", () => {
  it("displays the semester label and total credits", () => {
    render(
      <SemesterCard
        semester={createSemester({
          courses: [
            createCourse({
              id: "course-1",
              credits: 3,
            }),
            createCourse({
              id: "course-2",
              title: "General Biology",
              subjectArea: "science",
              credits: 4,
            }),
          ],
        })}
      />,
    )

    expect(
      screen.getByRole("heading", {
        name: "Fall 2027",
      }),
    ).toBeInTheDocument()

    expect(screen.getByText("2 planned courses")).toBeInTheDocument()

    expect(screen.getByText("7 credits")).toBeInTheDocument()
  })

  it("uses singular course wording for one planned course", () => {
    render(<SemesterCard semester={createSemester()} />)

    expect(screen.getByText("1 planned course")).toBeInTheDocument()
  })

  it("displays zero credits for an empty semester", () => {
    render(
      <SemesterCard
        semester={createSemester({
          courses: [],
        })}
      />,
    )

    expect(screen.getByText("0 planned courses")).toBeInTheDocument()

    expect(screen.getByText("0 credits")).toBeInTheDocument()
  })

  it("does not show movement controls when editing is disabled", () => {
    render(<SemesterCard semester={createSemester()} />)

    expect(
      screen.queryByRole("button", {
        name: "Move Calculus I to the previous semester",
      }),
    ).not.toBeInTheDocument()

    expect(
      screen.queryByRole("button", {
        name: "Move Calculus I to the next semester",
      }),
    ).not.toBeInTheDocument()
  })

  it("enables both movement controls for a middle semester", async () => {
    const user = userEvent.setup()
    const onMoveCourse = vi.fn()

    render(
      <SemesterCard
        semester={createSemester()}
        semesterIndex={1}
        semesterCount={3}
        editable
        onMoveCourse={onMoveCourse}
      />,
    )

    const earlierButton = screen.getByRole("button", {
      name: "Move Calculus I to the previous semester",
    })

    const laterButton = screen.getByRole("button", {
      name: "Move Calculus I to the next semester",
    })

    expect(earlierButton).toBeEnabled()
    expect(laterButton).toBeEnabled()

    await user.click(earlierButton)
    await user.click(laterButton)

    expect(onMoveCourse).toHaveBeenNthCalledWith(1, "course-1", "earlier")

    expect(onMoveCourse).toHaveBeenNthCalledWith(2, "course-1", "later")
  })

  it("prevents moving earlier from the first semester", () => {
    render(
      <SemesterCard
        semester={createSemester()}
        semesterIndex={0}
        semesterCount={2}
        editable
        onMoveCourse={vi.fn()}
      />,
    )

    expect(
      screen.getByRole("button", {
        name: "Move Calculus I to the previous semester",
      }),
    ).toBeDisabled()

    expect(
      screen.getByRole("button", {
        name: "Move Calculus I to the next semester",
      }),
    ).toBeEnabled()
  })

  it("prevents moving later from the final semester", () => {
    render(
      <SemesterCard
        semester={createSemester()}
        semesterIndex={1}
        semesterCount={2}
        editable
        onMoveCourse={vi.fn()}
      />,
    )

    expect(
      screen.getByRole("button", {
        name: "Move Calculus I to the previous semester",
      }),
    ).toBeEnabled()

    expect(
      screen.getByRole("button", {
        name: "Move Calculus I to the next semester",
      }),
    ).toBeDisabled()
  })

  it("displays semester-level validation errors", () => {
    const issue: PlanValidationIssue = {
      id: "semester-error",
      type: "credit_overload",
      severity: "error",
      message: "This semester exceeds the preferred credit target.",
      semesterId: "fall-2027",
    }

    render(
      <SemesterCard semester={createSemester()} validationIssues={[issue]} />,
    )

    expect(screen.getByRole("alert")).toHaveTextContent(
      "This semester exceeds the preferred credit target.",
    )
  })

  it("displays semester warnings without assigning alert semantics", () => {
    const issue: PlanValidationIssue = {
      id: "semester-warning",
      type: "credit_mismatch",
      severity: "warning",
      message: "This semester is below the preferred credit target.",
      semesterId: "fall-2027",
    }

    render(
      <SemesterCard semester={createSemester()} validationIssues={[issue]} />,
    )

    expect(
      screen.getByText("This semester is below the preferred credit target."),
    ).toBeInTheDocument()

    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("passes course-level issues to the matching course", () => {
    const matchingIssue: PlanValidationIssue = {
      id: "matching-course-error",
      type: "missing_prerequisite",
      severity: "error",
      message: "Calculus I requires College Algebra.",
      semesterId: "fall-2027",
      courseId: "course-1",
    }

    const unmatchedIssue: PlanValidationIssue = {
      id: "unmatched-course-error",
      type: "prerequisite_order",
      severity: "error",
      message: "This issue belongs to another course.",
      semesterId: "fall-2027",
      courseId: "other-course",
    }

    render(
      <SemesterCard
        semester={createSemester()}
        validationIssues={[matchingIssue, unmatchedIssue]}
      />,
    )

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Calculus I requires College Algebra.",
    )

    expect(
      screen.queryByText("This issue belongs to another course."),
    ).not.toBeInTheDocument()
  })

  it("displays course metadata through CourseCard", () => {
    render(
      <SemesterCard
        semester={createSemester({
          courses: [
            createCourse({
              prerequisites: ["college-algebra", "precalculus"],
            }),
          ],
        })}
      />,
    )

    expect(
      screen.getByRole("heading", {
        name: "Calculus I",
      }),
    ).toBeInTheDocument()

    expect(screen.getByText("MATHEMATICS")).toBeInTheDocument()

    expect(screen.getByText("planned")).toBeInTheDocument()

    expect(screen.getAllByText("3 credits")).toHaveLength(2)

    expect(screen.getByText("Prerequisites: 2 required")).toBeInTheDocument()
  })
})
