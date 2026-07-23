import { cn } from "@/lib/utils"

type ProgressVariant = "primary" | "success" | "warning"

interface ProgressProps {
  value: number
  max?: number
  label?: string
  description?: string
  showPercentage?: boolean
  variant?: ProgressVariant
  className?: string
}

const variants: Record<ProgressVariant, string> = {
  primary: "bg-primary",
  success: "bg-success-500",
  warning: "bg-warning-500",
}

export function Progress({
  value,
  max = 100,
  label,
  description,
  showPercentage = true,
  variant = "primary",
  className,
}: ProgressProps) {
  const percentage =
    max > 0 ? Math.min(Math.max((value / max) * 100, 0), 100) : 0

  return (
    <div className={className}>
      {label || showPercentage ? (
        <div className="mb-2 flex items-start justify-between gap-4">
          <div>
            {label ? (
              <p className="text-sm font-semibold text-text-primary">{label}</p>
            ) : null}

            {description ? (
              <p className="mt-0.5 text-xs text-text-tertiary">{description}</p>
            ) : null}
          </div>

          {showPercentage ? (
            <span className="shrink-0 font-display text-sm font-bold tabular-nums text-text-secondary">
              {Math.round(percentage)}%
            </span>
          ) : null}
        </div>
      ) : null}

      <div
        className="h-2.5 overflow-hidden rounded-full bg-surface-muted"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}>
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-500 ease-out",
            variants[variant],
          )}
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  )
}
