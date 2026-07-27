"use client"

import { CalendarDays, Gauge, GraduationCap, Info } from "lucide-react"

import { NumberInput } from "@/components/ui/number-input"
import { Select } from "@/components/ui/select"
import { academicPrograms } from "@/data/program"
import type { GeneratePlanOptions, PriorCredential } from "@/types/planner.type"

/**
 * Prior credentials supported by the generalized V1 workflow.
 */
const priorCredentialOptions: Array<{
  value: PriorCredential
  label: string
}> = [
  {
    value: "none",
    label: "No completed college degree",
  },
  {
    value: "associate",
    label: "Associate degree",
  },
  {
    value: "bachelor",
    label: "Bachelor’s degree",
  },
  {
    value: "other",
    label: "Other credential",
  },
]

interface PlanningPreferencesProps {
  value: GeneratePlanOptions
  onChange: (options: GeneratePlanOptions) => void
  disabled?: boolean
}

/**
 * Collects program, credential, term, year, and credit-load preferences.
 */
export function PlanningPreferences({
  value,
  onChange,
  disabled = false,
}: PlanningPreferencesProps) {
  const currentYear = new Date().getFullYear()

  /**
   * Merges a partial update into the current preferences.
   */
  function updateOptions(updates: Partial<GeneratePlanOptions>) {
    onChange({
      ...value,
      ...updates,
    })
  }

  /**
   * Disables summer and corrects an invalid summer start term.
   */
  function updateSummerPreference(includeSummer: boolean) {
    updateOptions({
      includeSummer,
      startTerm:
        !includeSummer && value.startTerm === "summer"
          ? "fall"
          : value.startTerm,
    })
  }

  return (
    <div className="grid gap-5">
      {/* Program */}
      <section className="rounded-2xl border border-border bg-surface-subtle p-4 sm:p-5">
        <div className="mb-5 flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-subtle text-primary">
            <GraduationCap className="size-5" />
          </div>

          <div>
            <h3 className="font-semibold text-text-primary">Academic path</h3>

            <p className="mt-0.5 text-sm text-text-tertiary">
              Choose the program and any prior degree you have completed.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid min-w-0 gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
              Academic program
            </span>

            <Select
              value={value.programId}
              disabled={disabled}
              onChange={(event) =>
                updateOptions({
                  programId: event.target.value,
                })
              }>
              {academicPrograms.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.name}
                </option>
              ))}
            </Select>
          </label>

          <div className="grid min-w-0 gap-1.5">
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                Prior degree
              </span>

              <Select
                value={value.priorCredential}
                disabled={disabled}
                onChange={(event) =>
                  updateOptions({
                    priorCredential: event.target.value as PriorCredential,
                  })
                }>
                {priorCredentialOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </label>

            {value.priorCredential !== "none" ? (
              <div className="flex items-start gap-2 rounded-xl border border-info bg-info-subtle p-3 text-xs leading-5 text-info-text">
                <Info className="mt-0.5 size-4 shrink-0" />

                <p>
                  Completed courses will be evaluated individually.
                  Credential-level waivers vary by institution and are not
                  automatically applied in this version.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* Starting schedule */}
      <section className="rounded-2xl border border-border bg-surface-subtle p-4 sm:p-5">
        <div className="mb-5 flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-subtle text-primary">
            <CalendarDays className="size-5" />
          </div>

          <div>
            <h3 className="font-semibold text-text-primary">
              Starting schedule
            </h3>

            <p className="mt-0.5 text-sm text-text-tertiary">
              Choose when the generated academic plan should begin.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid min-w-0 gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
              Starting term
            </span>

            <Select
              value={value.startTerm}
              disabled={disabled}
              onChange={(event) =>
                updateOptions({
                  startTerm: event.target
                    .value as GeneratePlanOptions["startTerm"],
                })
              }>
              <option value="fall">Fall</option>

              <option value="spring">Spring</option>

              <option value="summer" disabled={!value.includeSummer}>
                Summer
              </option>
            </Select>
          </label>

          <label className="grid min-w-0 gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
              Starting year
            </span>

            <NumberInput
              min={currentYear}
              max={currentYear + 10}
              value={value.startYear}
              disabled={disabled}
              onChange={(event) => {
                const startYear = event.currentTarget.valueAsNumber

                if (Number.isInteger(startYear)) {
                  updateOptions({
                    startYear,
                  })
                }
              }}
            />
          </label>
        </div>
      </section>

      {/* Course load */}
      <section className="rounded-2xl border border-border bg-surface-subtle p-4 sm:p-5">
        <div className="mb-5 flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-subtle text-primary">
            <Gauge className="size-5" />
          </div>

          <div>
            <h3 className="font-semibold text-text-primary">Course load</h3>

            <p className="mt-0.5 text-sm text-text-tertiary">
              Set the preferred number of credits for each academic term.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <label className="grid min-w-0 gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
              Fall/Spring credits
            </span>

            <Select
              value={value.fallSpringCreditTarget}
              disabled={disabled}
              onChange={(event) =>
                updateOptions({
                  fallSpringCreditTarget: Number(event.target.value),
                })
              }>
              <option value={6}>6 credits</option>

              <option value={9}>9 credits</option>

              <option value={12}>12 credits</option>

              <option value={15}>15 credits</option>

              <option value={18}>18 credits</option>
            </Select>
          </label>

          <label className="grid min-w-0 gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
              Summer courses
            </span>

            <Select
              value={value.includeSummer ? "yes" : "no"}
              disabled={disabled}
              onChange={(event) =>
                updateSummerPreference(event.target.value === "yes")
              }>
              <option value="yes">Include summer</option>

              <option value="no">Skip summer</option>
            </Select>
          </label>

          <label className="grid min-w-0 gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
              Summer credits
            </span>

            <Select
              value={value.summerCreditTarget}
              disabled={disabled || !value.includeSummer}
              onChange={(event) =>
                updateOptions({
                  summerCreditTarget: Number(event.target.value),
                })
              }>
              <option value={3}>3 credits</option>

              <option value={6}>6 credits</option>

              <option value={9}>9 credits</option>
            </Select>
          </label>
        </div>
      </section>
    </div>
  )
}
