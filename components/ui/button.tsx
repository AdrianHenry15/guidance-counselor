import type { ButtonHTMLAttributes, ReactNode } from "react"

import { cn } from "@/lib/utils"

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "tertiary"
  | "danger"
  | "ghost"
  | "on-brand"

export type ButtonSize = "sm" | "md" | "lg" | "icon"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  loadingText?: string
  children: ReactNode
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[image:var(--gradient-primary)] text-brand-on-surface shadow-primary hover:bg-[image:var(--gradient-primary-hover)]",

  secondary:
    "border border-border-strong bg-surface text-text-primary shadow-xs hover:bg-surface-muted",

  outline:
    "border border-primary bg-transparent text-primary hover:bg-primary-subtle",

  tertiary:
    "bg-primary-subtle text-primary hover:bg-brand-100 dark:hover:bg-brand-900/40",

  danger: "bg-danger-600 text-white shadow-xs hover:bg-danger-700",

  ghost:
    "bg-transparent text-text-secondary hover:bg-surface-muted hover:text-text-primary",

  "on-brand":
    "border border-button-secondary-border bg-button-secondary-background text-button-secondary-foreground shadow-sm hover:bg-button-secondary-hover",
}

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-9 rounded-lg px-3 text-sm",
  md: "min-h-11 rounded-xl px-4 text-sm",
  lg: "min-h-12 rounded-xl px-5 text-base",
  icon: "size-11 rounded-xl p-0",
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  loading = false,
  loadingText = "Loading...",
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap font-semibold transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200",
        "disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}>
      {loading ? loadingText : children}
    </button>
  )
}
