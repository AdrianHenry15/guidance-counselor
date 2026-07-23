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
    <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-white lg:flex lg:flex-col">
      <div className="flex h-20 items-center border-b border-slate-200 px-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-slate-950 text-white">
            <GraduationCap className="size-5" />
          </div>

          <div>
            <p className="font-bold text-slate-950">Guidance Counselor</p>
            <p className="text-xs text-slate-500">Academic planning</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950">
              <Icon className="size-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950">
          <Settings className="size-5" />
          Settings
        </Link>
      </div>
    </aside>
  )
}
