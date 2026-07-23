import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Upload Transcript",
  description:
    "Upload a transcript to identify completed coursework and begin academic planning.",
}

export default function UploadLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
