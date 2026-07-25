import { forwardRef, type InputHTMLAttributes } from "react"

import { cn } from "@/lib/utils"

/**
 * Renders a consistently styled native numeric input.
 */
export const NumberInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(function NumberInput({ className, min, max, step = 1, ...props }, ref) {
  return (
    <input
      ref={ref}
      type="number"
      min={min}
      max={max}
      step={step}
      className={cn(
        "min-h-11 w-full rounded-xl border border-border-strong bg-surface px-3 py-2 text-sm text-text-primary outline-none transition",
        "placeholder:text-text-tertiary",
        "focus:border-primary focus:ring-4 focus:ring-primary-subtle",
        "disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-disabled disabled:opacity-60",
        "aria-invalid:border-danger aria-invalid:ring-danger-subtle",
        className,
      )}
      {...props}
    />
  )
})
