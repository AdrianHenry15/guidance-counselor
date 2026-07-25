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

  success: "bg-success-subtle text-success-text",

  warning: "bg-warning-subtle text-warning-text",

  danger: "bg-danger-subtle text-danger-text",

  info: "bg-info-subtle text-info-text",

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
