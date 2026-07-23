import { ReactNode } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { BottomNavigation } from "./bottom-navigation"

interface AppShellProps {
  children: ReactNode
  title: string
  description?: string
}

export function AppShell({ children, title, description }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <div className="lg:pl-72">
        <Header title={title} description={description} />

        <main className="mx-auto w-full max-w-7xl px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-10">
          {children}
        </main>
      </div>

      <BottomNavigation />
    </div>
  )
}
