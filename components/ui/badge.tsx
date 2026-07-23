import type { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

type BadgeVariant =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "accent"

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variants: Record<BadgeVariant, string> = {
  neutral: "bg-surface-muted text-text-secondary",

  primary: "bg-primary-subtle text-primary",

  success:
    "bg-success-50 text-success-700 dark:bg-success-700/25 dark:text-green-300",

  warning:
    "bg-warning-50 text-warning-700 dark:bg-warning-700/25 dark:text-amber-300",

  danger:
    "bg-danger-50 text-danger-700 dark:bg-danger-700/25 dark:text-red-300",

  info: "bg-info-50 text-info-700 dark:bg-brand-900/40 dark:text-blue-300",

  accent: "bg-accent-subtle text-accent-foreground",
}
export function Badge({
  variant = "neutral",
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}
