"use client"

import { Laptop, Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

import { useTheme } from "@/components/providers/theme-provider"
import { cn } from "@/lib/utils"

const options = [
  {
    value: "light",
    label: "Light",
    icon: Sun,
  },
  {
    value: "dark",
    label: "Dark",
    icon: Moon,
  },
  {
    value: "system",
    label: "System",
    icon: Laptop,
  },
] as const

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setMounted(true)
    }, 0)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [])

  if (!mounted) {
    return (
      <div
        className="inline-flex rounded-xl border border-border bg-surface-muted p-1"
        aria-hidden="true">
        {options.map((option) => (
          <span key={option.value} className="block size-9 rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div
      className="inline-flex rounded-xl border border-border bg-surface-muted p-1"
      aria-label="Choose color theme">
      {options.map((option) => {
        const Icon = option.icon
        const selected = theme === option.value

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setTheme(option.value)}
            aria-pressed={selected}
            aria-label={`${option.label} theme`}
            className={cn(
              "flex size-9 cursor-pointer items-center justify-center rounded-lg transition-colors",
              selected
                ? "bg-surface text-primary shadow-sm"
                : "text-text-tertiary hover:text-text-primary",
            )}>
            <Icon className="size-4" />
          </button>
        )
      })}
    </div>
  )
}
