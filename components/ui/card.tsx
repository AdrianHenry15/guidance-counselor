import type { HTMLAttributes } from "react"

import { cn } from "@/lib/utils"

type CardVariant = "default" | "subtle" | "elevated" | "interactive"

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
}

const variants: Record<CardVariant, string> = {
  default: "border border-border bg-surface shadow-xs",

  subtle: "border border-border bg-surface-subtle",

  elevated: "border border-border bg-surface-elevated shadow-md",

  interactive:
    "border border-border bg-surface shadow-xs transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md",
}

export function Card({ className, variant = "default", ...props }: CardProps) {
  return (
    <div
      className={cn("rounded-2xl", variants[variant], className)}
      {...props}
    />
  )
}
