"use client"

import { ChevronDown } from "lucide-react"
import { forwardRef, type SelectHTMLAttributes } from "react"

import { cn } from "@/lib/utils"

/**
 * Renders a consistently styled native select with a custom arrow.
 */
export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, children, disabled, ...props }, ref) {
  return (
    <div className="relative min-w-0">
      <select
        ref={ref}
        disabled={disabled}
        className={cn(
          "min-h-11 w-full cursor-pointer appearance-none rounded-xl border border-border-strong bg-surface py-2 pl-3 pr-10 text-sm text-text-primary outline-none transition",
          "focus:border-primary focus:ring-4 focus:ring-primary-subtle",
          "disabled:cursor-not-allowed disabled:opacity-60",
          className,
        )}
        {...props}>
        {children}
      </select>

      <ChevronDown
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-text-tertiary",
          disabled && "opacity-60",
        )}
      />
    </div>
  )
})
