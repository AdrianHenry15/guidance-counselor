import Link from "next/link"
import {
  FileText,
  GraduationCap,
  LayoutDashboard,
  Settings,
  Upload,
} from "lucide-react"

const navigation = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Upload Transcript",
    href: "/upload",
    icon: Upload,
  },
  {
    label: "Academic Plan",
    href: "/planner",
    icon: GraduationCap,
  },
  {
    label: "Transcript",
    href: "/transcript",
    icon: FileText,
  },
]

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-border bg-surface lg:flex lg:flex-col">
      <div className="flex h-20 items-center border-b border-border px-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <GraduationCap className="size-5" />
          </div>

          <div>
            <p className="font-display font-bold tracking-tight text-text-primary">
              Guidance Counselor
            </p>

            <p className="text-xs text-text-tertiary">Academic planning</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1.5 p-4">
        {navigation.map((item) => {
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className="group flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-text-secondary transition-colors hover:bg-primary-subtle hover:text-primary">
              <Icon className="size-5 text-text-tertiary transition-colors group-hover:text-primary" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border p-4">
        <Link
          href="/settings"
          className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary">
          <Settings className="size-5" />
          Settings
        </Link>
      </div>
    </aside>
  )
}
