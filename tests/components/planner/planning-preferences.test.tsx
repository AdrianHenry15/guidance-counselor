// @vitest-environment jsdom

import { fireEvent, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { PlanningPreferences } from "@/components/planner/planning-preferences"
import type { GeneratePlanOptions } from "@/types/planner.type"

const currentYear = new Date().getFullYear()

const defaultOptions: GeneratePlanOptions = {
  programId: "bachelor-computer-science",
  priorCredential: "none",
  startTerm: "fall",
  startYear: currentYear + 1,
  fallSpringCreditTarget: 12,
  summerCreditTarget: 6,
  includeSummer: true,
}

function renderPreferences(
  overrides: Partial<GeneratePlanOptions> = {},
  disabled = false,
) {
  const value: GeneratePlanOptions = {
    ...defaultOptions,
    ...overrides,
  }

  const onChange = vi.fn()

  render(
    <PlanningPreferences
      value={value}
      onChange={onChange}
      disabled={disabled}
    />,
  )

  return {
    value,
    onChange,
  }
}

describe("PlanningPreferences", () => {
  it("renders the current planning preferences", () => {
    renderPreferences()

    expect(screen.getByLabelText("Academic program")).toHaveValue(
      "bachelor-computer-science",
    )

    expect(screen.getByLabelText("Prior degree")).toHaveValue("none")

    expect(screen.getByLabelText("Starting term")).toHaveValue("fall")

    expect(screen.getByLabelText("Starting year")).toHaveValue(currentYear + 1)

    expect(screen.getByLabelText("Fall/Spring credits")).toHaveValue("12")

    expect(screen.getByLabelText("Summer courses")).toHaveValue("yes")

    expect(screen.getByLabelText("Summer credits")).toHaveValue("6")
  })

  it("renders the available academic program", () => {
    renderPreferences()

    const programSelect = screen.getByLabelText("Academic program")

    expect(
      within(programSelect).getByRole("option", {
        name: "Bachelor's Degree in Computer Science",
      }),
    ).toHaveValue("bachelor-computer-science")
  })

  it("updates the prior credential without changing other preferences", async () => {
    const user = userEvent.setup()

    const { value, onChange } = renderPreferences()

    await user.selectOptions(screen.getByLabelText("Prior degree"), "associate")

    expect(onChange).toHaveBeenCalledWith({
      ...value,
      priorCredential: "associate",
    })
  })

  it("shows the credential evaluation notice when a prior degree is selected", () => {
    renderPreferences({
      priorCredential: "associate",
    })

    expect(
      screen.getByText(/completed courses will be evaluated individually/i),
    ).toBeInTheDocument()
  })

  it("hides the credential evaluation notice when no degree is selected", () => {
    renderPreferences({
      priorCredential: "none",
    })

    expect(
      screen.queryByText(/completed courses will be evaluated individually/i),
    ).not.toBeInTheDocument()
  })

  it("updates the starting term without changing other preferences", async () => {
    const user = userEvent.setup()

    const { value, onChange } = renderPreferences()

    await user.selectOptions(screen.getByLabelText("Starting term"), "spring")

    expect(onChange).toHaveBeenCalledWith({
      ...value,
      startTerm: "spring",
    })
  })

  it("updates the starting year when the value is an integer", () => {
    const { value, onChange } = renderPreferences()

    const updatedYear = currentYear + 3

    fireEvent.change(screen.getByLabelText("Starting year"), {
      target: {
        value: String(updatedYear),
      },
    })

    expect(onChange).toHaveBeenCalledWith({
      ...value,
      startYear: updatedYear,
    })
  })

  it("ignores a non-integer starting year", () => {
    const { onChange } = renderPreferences()

    fireEvent.change(screen.getByLabelText("Starting year"), {
      target: {
        value: `${currentYear + 1}.5`,
      },
    })

    expect(onChange).not.toHaveBeenCalled()
  })

  it("uses a dynamic ten-year starting-year range", () => {
    renderPreferences()

    const yearInput = screen.getByLabelText("Starting year")

    expect(yearInput).toHaveAttribute("min", String(currentYear))

    expect(yearInput).toHaveAttribute("max", String(currentYear + 10))
  })

  it("updates the fall and spring credit target as a number", async () => {
    const user = userEvent.setup()

    const { value, onChange } = renderPreferences()

    await user.selectOptions(screen.getByLabelText("Fall/Spring credits"), "15")

    expect(onChange).toHaveBeenCalledWith({
      ...value,
      fallSpringCreditTarget: 15,
    })
  })

  it("updates the summer credit target as a number", async () => {
    const user = userEvent.setup()

    const { value, onChange } = renderPreferences()

    await user.selectOptions(screen.getByLabelText("Summer credits"), "9")

    expect(onChange).toHaveBeenCalledWith({
      ...value,
      summerCreditTarget: 9,
    })
  })

  it("disables summer and preserves a non-summer starting term", async () => {
    const user = userEvent.setup()

    const { value, onChange } = renderPreferences({
      startTerm: "spring",
      includeSummer: true,
    })

    await user.selectOptions(screen.getByLabelText("Summer courses"), "no")

    expect(onChange).toHaveBeenCalledWith({
      ...value,
      includeSummer: false,
      startTerm: "spring",
    })
  })

  it("changes a summer starting term to fall when summer is disabled", async () => {
    const user = userEvent.setup()

    const { value, onChange } = renderPreferences({
      startTerm: "summer",
      includeSummer: true,
    })

    await user.selectOptions(screen.getByLabelText("Summer courses"), "no")

    expect(onChange).toHaveBeenCalledWith({
      ...value,
      includeSummer: false,
      startTerm: "fall",
    })
  })

  it("disables summer-specific controls when summer is excluded", () => {
    renderPreferences({
      includeSummer: false,
      startTerm: "fall",
    })

    expect(screen.getByLabelText("Summer credits")).toBeDisabled()

    const startingTermSelect = screen.getByLabelText("Starting term")

    expect(
      within(startingTermSelect).getByRole("option", {
        name: "Summer",
      }),
    ).toBeDisabled()
  })

  it("keeps summer-specific controls enabled when summer is included", () => {
    renderPreferences({
      includeSummer: true,
    })

    expect(screen.getByLabelText("Summer credits")).toBeEnabled()

    const startingTermSelect = screen.getByLabelText("Starting term")

    expect(
      within(startingTermSelect).getByRole("option", {
        name: "Summer",
      }),
    ).toBeEnabled()
  })

  it("disables every preference control when the component is disabled", () => {
    renderPreferences({}, true)

    const selectControls = screen.getAllByRole("combobox")

    expect(selectControls).toHaveLength(6)

    for (const control of selectControls) {
      expect(control).toBeDisabled()
    }

    expect(
      screen.getByRole("spinbutton", {
        name: "Starting year",
      }),
    ).toBeDisabled()
  })
})
