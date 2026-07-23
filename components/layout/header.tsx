import { Bell, GraduationCap } from "lucide-react"

interface AppHeaderProps {
  title: string
  description?: string
}

export function Header({ title, description }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex min-h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white lg:hidden">
            <GraduationCap className="size-5" />
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold text-slate-950 sm:text-xl">
              {title}
            </h1>

            {description ? (
              <p className="truncate text-sm text-slate-500">{description}</p>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          aria-label="View notifications"
          className="flex size-11 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-950">
          <Bell className="size-5" />
        </button>
      </div>
    </header>
  )
}
