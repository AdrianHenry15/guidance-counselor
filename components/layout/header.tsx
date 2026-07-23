import { Bell, GraduationCap } from "lucide-react"
import { ThemeToggle } from "@/components/ui/theme-toggle"

interface HeaderProps {
  title: string
  description?: string
}

export function Header({ title, description }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur-xl">
      <div className="flex min-h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm lg:hidden">
            <GraduationCap className="size-5" />
          </div>

          <div className="min-w-0">
            <h1 className="truncate font-display text-lg font-bold tracking-tight text-text-primary sm:text-xl">
              {title}
            </h1>

            {description ? (
              <p className="truncate text-sm text-text-tertiary">
                {description}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          <button
            type="button"
            aria-label="View notifications"
            className="flex size-11 cursor-pointer items-center justify-center rounded-xl text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary">
            <Bell className="size-5" />
          </button>
        </div>
      </div>
    </header>
  )
}
