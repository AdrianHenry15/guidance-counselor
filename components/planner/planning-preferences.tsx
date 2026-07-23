"use client"

import type { GeneratePlanOptions } from "@/types/planner.type"

interface PlanningPreferencesProps {
  value: GeneratePlanOptions
  onChange: (options: GeneratePlanOptions) => void
  disabled?: boolean
}

export function PlanningPreferences({
  value,
  onChange,
  disabled = false,
}: PlanningPreferencesProps) {
  function updateOptions(updates: Partial<GeneratePlanOptions>) {
    onChange({
      ...value,
      ...updates,
    })
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
      <label className="grid gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
          Starting term
        </span>

        <select
          value={value.startTerm}
          disabled={disabled}
          onChange={(event) =>
            updateOptions({
              startTerm: event.target.value as GeneratePlanOptions["startTerm"],
            })
          }
          className="min-h-11 rounded-xl border border-border-strong bg-surface px-3 text-sm text-text-primary outline-none transition focus:border-primary focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:opacity-60">
          <option value="fall">Fall</option>
          <option value="spring">Spring</option>
          <option value="summer">Summer</option>
        </select>
      </label>

      <label className="grid gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
          Starting year
        </span>

        <input
          type="number"
          min={new Date().getFullYear()}
          max={new Date().getFullYear() + 10}
          value={value.startYear}
          disabled={disabled}
          onChange={(event) => {
            const startYear = Number(event.target.value)

            updateOptions({
              startYear: Number.isFinite(startYear)
                ? startYear
                : new Date().getFullYear(),
            })
          }}
          className="min-h-11 rounded-xl border border-border-strong bg-surface px-3 text-sm text-text-primary outline-none transition focus:border-primary focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </label>

      <label className="grid gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
          Fall/Spring credits
        </span>

        <select
          value={value.fallSpringCreditTarget}
          disabled={disabled}
          onChange={(event) =>
            updateOptions({
              fallSpringCreditTarget: Number(event.target.value),
            })
          }
          className="min-h-11 rounded-xl border border-border-strong bg-surface px-3 text-sm text-text-primary outline-none transition focus:border-primary focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:opacity-60">
          <option value={6}>6 credits</option>
          <option value={9}>9 credits</option>
          <option value={12}>12 credits</option>
          <option value={15}>15 credits</option>
          <option value={18}>18 credits</option>
        </select>
      </label>

      <label className="grid gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
          Summer courses
        </span>

        <select
          value={value.includeSummer ? "yes" : "no"}
          disabled={disabled}
          onChange={(event) =>
            updateOptions({
              includeSummer: event.target.value === "yes",
            })
          }
          className="min-h-11 rounded-xl border border-border-strong bg-surface px-3 text-sm text-text-primary outline-none transition focus:border-primary focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:opacity-60">
          <option value="yes">Include summer</option>
          <option value="no">Skip summer</option>
        </select>
      </label>

      <label className="grid gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
          Summer credits
        </span>

        <select
          value={value.summerCreditTarget}
          disabled={disabled || !value.includeSummer}
          onChange={(event) =>
            updateOptions({
              summerCreditTarget: Number(event.target.value),
            })
          }
          className="min-h-11 rounded-xl border border-border-strong bg-surface px-3 text-sm text-text-primary outline-none transition focus:border-primary focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:opacity-60">
          <option value={3}>3 credits</option>
          <option value={6}>6 credits</option>
          <option value={9}>9 credits</option>
        </select>
      </label>
    </div>
  )
}
