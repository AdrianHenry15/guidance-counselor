import { describe, expect, it } from "vitest"

import { computerScienceBachelorProgram } from "@/data/degree.data"
import { createDegreeAudit } from "@/lib/planner/create-degree-audit"

describe("createDegreeAudit", () => {
  it("creates a zero-progress audit", () => {
    const audit = createDegreeAudit({
      program: computerScienceBachelorProgram,
      appliedCreditsByRequirementId: {},
    })

    expect(audit.totalRequiredCredits).toBe(120)

    expect(audit.totalAppliedCredits).toBe(0)

    expect(audit.totalRemainingCredits).toBe(120)

    expect(audit.completionPercentage).toBe(0)
  })

  it("caps requirement progress at its required credits", () => {
    const requirement = computerScienceBachelorProgram.requirements[0]

    expect(requirement).toBeDefined()

    const audit = createDegreeAudit({
      program: computerScienceBachelorProgram,
      appliedCreditsByRequirementId: {
        [requirement.id]: requirement.requiredCredits + 20,
      },
    })

    const progress = audit.requirements.find(
      (item) => item.requirementId === requirement.id,
    )

    expect(progress?.appliedCredits).toBe(requirement.requiredCredits)

    expect(progress?.remainingCredits).toBe(0)

    expect(progress?.status).toBe("complete")
  })

  it("keeps requirement totals aligned with the program", () => {
    const audit = createDegreeAudit({
      program: computerScienceBachelorProgram,
      appliedCreditsByRequirementId: {},
    })

    const requirementCredits = audit.requirements.reduce(
      (total, requirement) => total + requirement.requiredCredits,
      0,
    )

    expect(requirementCredits).toBe(audit.totalRequiredCredits)
  })
})
