interface ProgressProps {
  value: number
  max?: number
  label?: string
}

export function Progress({ value, max = 100, label }: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  return (
    <div>
      {label ? (
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700">{label}</span>
          <span className="text-slate-500">{Math.round(percentage)}%</span>
        </div>
      ) : null}

      <div
        className="h-2.5 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}>
        <div
          className="h-full rounded-full bg-slate-950 transition-[width]"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
