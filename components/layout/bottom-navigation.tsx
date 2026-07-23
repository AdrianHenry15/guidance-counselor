"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { GraduationCap, LayoutDashboard, Upload } from "lucide-react"

import { cn } from "@/lib/utils"

const navigation = [
  {
    label: "Home",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Upload",
    href: "/upload",
    icon: Upload,
  },
  {
    label: "Plan",
    href: "/planner",
    icon: GraduationCap,
  },
]

export function BottomNavigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl lg:hidden">
      <div className="grid grid-cols-3 gap-2">
        {navigation.map((item) => {
          const Icon = item.icon
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-xs font-semibold transition-colors",
                active
                  ? "bg-primary-subtle text-primary"
                  : "text-text-tertiary hover:bg-surface-muted hover:text-text-primary",
              )}>
              <Icon className="size-5" />
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
