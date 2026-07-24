import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Review academic progress, upcoming coursework, and graduation estimates.",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
