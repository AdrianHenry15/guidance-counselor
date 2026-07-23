"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  FileText,
  GraduationCap,
  LayoutDashboard,
  Settings,
  Upload,
} from "lucide-react"

import { cn } from "@/lib/utils"

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
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-border bg-(image:--gradient-sidebar) lg:flex lg:flex-col">
      <div className="flex h-20 items-center border-b border-border px-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-(image:--gradient-primary) text-brand-on-surface shadow-primary">
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
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
                active
                  ? "bg-(image:var(--gradient-primary)) text-brand-on-surface shadow-sm"
                  : "text-text-secondary hover:bg-primary-subtle hover:text-primary",
              )}>
              <Icon
                className={cn(
                  "size-5 transition-colors",
                  active
                    ? "text-brand-on-surface"
                    : "text-text-tertiary group-hover:text-primary",
                )}
              />

              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border p-4">
        <Link
          href="/settings"
          className={cn(
            "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
            pathname === "/settings"
              ? "bg-(image:var(--gradient-primary)) text-brand-on-surface shadow-sm"
              : "text-text-secondary hover:bg-primary-subtle hover:text-primary",
          )}>
          <Settings className="size-5" />
          Settings
        </Link>
      </div>
    </aside>
  )
}
