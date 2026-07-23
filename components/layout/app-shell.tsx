import type { ReactNode } from "react"

import { Header } from "./header"
import { BottomNavigation } from "./bottom-navigation"
import { Sidebar } from "./sidebar"

interface AppShellProps {
  children: ReactNode
  title: string
  description?: string
}

export function AppShell({ children, title, description }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />

      <div className="lg:pl-72">
        <Header title={title} description={description} />

        <main className="mx-auto w-full max-w-(--content-max-width) px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">
          {children}
        </main>
      </div>

      <BottomNavigation />
    </div>
  )
}
