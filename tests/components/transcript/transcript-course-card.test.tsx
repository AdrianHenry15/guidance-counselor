// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { TranscriptCourseCard } from "@/components/transcript/transcript-course-card"
import { createTranscriptCourse } from "@/tests/factories/transcript-course.factory"

function renderCourseCard(
  overrides: Parameters<typeof createTranscriptCourse>[0] = {},
) {
  const course = createTranscriptCourse({
    id: "course-1",
    title: "English Composition I",
    subjectArea: "english",
    credits: 3,
    completionStatus: "passed",
    includedInPlan: true,
    source: "extracted",
    ...overrides,
  })

  const onUpdate = vi.fn()
  const onRemove = vi.fn()

  render(
    <TranscriptCourseCard
      course={course}
      onUpdate={onUpdate}
      onRemove={onRemove}
    />,
  )

  return {
    course,
    onUpdate,
    onRemove,
  }
}

describe("TranscriptCourseCard", () => {
  it("starts an extracted course collapsed", () => {
    renderCourseCard()

    expect(
      screen.getByRole("button", {
        name: /click to review or edit/i,
      }),
    ).toHaveAttribute("aria-expanded", "false")

    expect(
      screen.queryByPlaceholderText("Course title"),
    ).not.toBeInTheDocument()
  })

  it("starts a blank manual course expanded", () => {
    renderCourseCard({
      normalizedTitle: "",
      originalName: "Manually added course",
      source: "manual",
    })

    expect(screen.getByText("Untitled course")).toBeInTheDocument()

    expect(
      screen.getByRole("button", {
        name: /click to close editor/i,
      }),
    ).toHaveAttribute("aria-expanded", "true")

    expect(screen.getByPlaceholderText("Course title")).toBeInTheDocument()
  })

  it("opens and closes the course editor", async () => {
    const user = userEvent.setup()

    renderCourseCard()

    const summaryButton = screen.getByRole("button", {
      name: /click to review or edit/i,
    })

    await user.click(summaryButton)

    expect(screen.getByPlaceholderText("Course title")).toBeInTheDocument()

    expect(
      screen.getByRole("button", {
        name: /click to close editor/i,
      }),
    ).toHaveAttribute("aria-expanded", "true")

    await user.click(
      screen.getByRole("button", {
        name: /click to close editor/i,
      }),
    )

    expect(
      screen.queryByPlaceholderText("Course title"),
    ).not.toBeInTheDocument()
  })

  it("removes the course without opening the editor", async () => {
    const user = userEvent.setup()

    const { course, onRemove } = renderCourseCard()

    await user.click(
      screen.getByRole("button", {
        name: `Remove ${course.normalizedTitle}`,
      }),
    )

    expect(onRemove).toHaveBeenCalledOnce()

    expect(onRemove).toHaveBeenCalledWith(course.id)

    expect(
      screen.queryByPlaceholderText("Course title"),
    ).not.toBeInTheDocument()

    expect(
      screen.getByRole("button", {
        name: /click to review or edit/i,
      }),
    ).toHaveAttribute("aria-expanded", "false")
  })

  it("updates the normalized course title", async () => {
    const user = userEvent.setup()

    const { course, onUpdate } = renderCourseCard()

    await user.click(
      screen.getByRole("button", {
        name: /click to review or edit/i,
      }),
    )

    fireEvent.change(screen.getByLabelText("Course"), {
      target: {
        value: "English Composition II",
      },
    })

    expect(onUpdate).toHaveBeenCalledWith(course.id, {
      normalizedTitle: "English Composition II",
    })
  })

  it("updates the subject area", async () => {
    const user = userEvent.setup()

    const { course, onUpdate } = renderCourseCard()

    await user.click(
      screen.getByRole("button", {
        name: /click to review or edit/i,
      }),
    )

    await user.selectOptions(screen.getByLabelText("Subject"), "humanities")

    expect(onUpdate).toHaveBeenCalledWith(course.id, {
      subjectArea: "humanities",
    })
  })

  it("updates credits as a number", async () => {
    const user = userEvent.setup()

    const { course, onUpdate } = renderCourseCard()

    await user.click(
      screen.getByRole("button", {
        name: /click to review or edit/i,
      }),
    )

    fireEvent.change(screen.getByLabelText("Credits"), {
      target: {
        value: "4.5",
      },
    })

    expect(onUpdate).toHaveBeenCalledWith(course.id, {
      credits: 4.5,
    })
  })

  it("excludes a course automatically when its status changes from passed", async () => {
    const user = userEvent.setup()

    const { course, onUpdate } = renderCourseCard()

    await user.click(
      screen.getByRole("button", {
        name: /click to review or edit/i,
      }),
    )

    await user.selectOptions(screen.getByLabelText("Status"), "failed")

    expect(onUpdate).toHaveBeenCalledWith(course.id, {
      completionStatus: "failed",
      includedInPlan: false,
    })
  })

  it("includes a course automatically when its status changes to passed", async () => {
    const user = userEvent.setup()

    const { course, onUpdate } = renderCourseCard({
      completionStatus: "failed",
      includedInPlan: false,
    })

    await user.click(
      screen.getByRole("button", {
        name: /click to review or edit/i,
      }),
    )

    await user.selectOptions(screen.getByLabelText("Status"), "passed")

    expect(onUpdate).toHaveBeenCalledWith(course.id, {
      completionStatus: "passed",
      includedInPlan: true,
    })
  })

  it("prevents a failed course from being included", async () => {
    const user = userEvent.setup()

    renderCourseCard({
      completionStatus: "failed",
      includedInPlan: false,
    })

    await user.click(
      screen.getByRole("button", {
        name: /click to review or edit/i,
      }),
    )

    const eligibilityButton = screen.getByRole("button", {
      name: "Not eligible",
    })

    expect(eligibilityButton).toBeDisabled()

    expect(eligibilityButton).toHaveAttribute("aria-pressed", "false")
  })

  it("allows a passed included course to be excluded", async () => {
    const user = userEvent.setup()

    const { course, onUpdate } = renderCourseCard({
      completionStatus: "passed",
      includedInPlan: true,
    })

    await user.click(
      screen.getByRole("button", {
        name: /click to review or edit/i,
      }),
    )

    const excludeButton = screen.getByRole("button", {
      name: "Exclude from plan",
    })

    expect(excludeButton).toBeEnabled()

    expect(excludeButton).toHaveAttribute("aria-pressed", "true")

    await user.click(excludeButton)

    expect(onUpdate).toHaveBeenCalledWith(course.id, {
      includedInPlan: false,
    })
  })

  it("allows a passed excluded course to be included", async () => {
    const user = userEvent.setup()

    const { course, onUpdate } = renderCourseCard({
      completionStatus: "passed",
      includedInPlan: false,
    })

    await user.click(
      screen.getByRole("button", {
        name: /click to review or edit/i,
      }),
    )

    const includeButton = screen.getByRole("button", {
      name: "Include in plan",
    })

    expect(includeButton).toBeEnabled()

    expect(includeButton).toHaveAttribute("aria-pressed", "false")

    await user.click(includeButton)

    expect(onUpdate).toHaveBeenCalledWith(course.id, {
      includedInPlan: true,
    })
  })

  it("displays the collapsed course summary and transcript metadata", () => {
    renderCourseCard({
      originalName: "ENC 1101",
      normalizedTitle: "English Composition I",
      credits: 3,
      grade: "A",
      confidence: 0.88,
      source: "extracted",
    })

    expect(screen.getByText("English Composition I")).toBeInTheDocument()

    expect(screen.getByText("3 credits")).toBeInTheDocument()

    expect(screen.getByText("Passed")).toBeInTheDocument()

    expect(screen.getByText("Transcript")).toBeInTheDocument()

    expect(screen.getByText("Confidence: 88%")).toBeInTheDocument()

    expect(screen.getByText("Grade: A")).toBeInTheDocument()

    expect(screen.getByText("Original: ENC 1101")).toBeInTheDocument()
  })

  it("uses singular credit wording for one credit", () => {
    renderCourseCard({
      credits: 1,
    })

    expect(screen.getByText("1 credit")).toBeInTheDocument()
  })

  it("does not display extraction confidence for a manual course", () => {
    renderCourseCard({
      source: "manual",
      confidence: 1,
    })

    expect(screen.getByText("Manual entry")).toBeInTheDocument()

    expect(screen.queryByText(/confidence:/i)).not.toBeInTheDocument()
  })
})
