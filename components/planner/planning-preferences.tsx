"use client"

import { academicPrograms } from "@/data/program"
import type { GeneratePlanOptions, PriorCredential } from "@/types/planner.type"
import { Select } from "../ui/select"
import { NumberInput } from "../ui/number-input"

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
 * Shared styling for planning form controls.
 */
const controlClassName =
  "min-h-11 w-full appearance-none rounded-xl border border-border-strong bg-surface py-2 pl-3 pr-10 text-sm text-text-primary outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-subtle disabled:cursor-not-allowed disabled:opacity-60"
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
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      {/* Academic program */}
      <label className="grid min-w-0 gap-1.5 md:col-span-2">
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
          }
          className={controlClassName}>
          {academicPrograms.map((program) => (
            <option key={program.id} value={program.id}>
              {program.name}
            </option>
          ))}
        </Select>
      </label>

      {/* Prior degree */}
      <div className="grid min-w-0 gap-1.5 md:col-span-2">
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
            }
            className={controlClassName}>
            {priorCredentialOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </label>

        {value.priorCredential !== "none" ? (
          <p className="text-xs leading-5 text-text-tertiary">
            Completed courses will be evaluated individually. Credential-level
            waivers vary by institution and are not automatically applied in
            this version.
          </p>
        ) : null}
      </div>

      {/* Starting term */}
      <label className="grid min-w-0 gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
          Starting term
        </span>

        <Select
          value={value.startTerm}
          disabled={disabled}
          onChange={(event) =>
            updateOptions({
              startTerm: event.target.value as GeneratePlanOptions["startTerm"],
            })
          }
          className={controlClassName}>
          <option value="fall">Fall</option>
          <option value="spring">Spring</option>
          <option value="summer" disabled={!value.includeSummer}>
            Summer
          </option>
        </Select>
      </label>

      {/* Starting year */}
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

      {/* Fall and spring credits */}
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
          }
          className={controlClassName}>
          <option value={6}>6 credits</option>
          <option value={9}>9 credits</option>
          <option value={12}>12 credits</option>
          <option value={15}>15 credits</option>
          <option value={18}>18 credits</option>
        </Select>
      </label>

      {/* Summer preference */}
      <label className="grid min-w-0 gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
          Summer courses
        </span>

        <Select
          value={value.includeSummer ? "yes" : "no"}
          disabled={disabled}
          onChange={(event) =>
            updateSummerPreference(event.target.value === "yes")
          }
          className={controlClassName}>
          <option value="yes">Include summer</option>
          <option value="no">Skip summer</option>
        </Select>
      </label>

      {/* Summer credits */}
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
          }
          className={controlClassName}>
          <option value={3}>3 credits</option>
          <option value={6}>6 credits</option>
          <option value={9}>9 credits</option>
        </Select>
      </label>
    </div>
  )
}
