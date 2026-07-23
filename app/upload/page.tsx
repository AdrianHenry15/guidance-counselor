"use client"

import { useRef, useState } from "react"
import { FileText, LockKeyhole, UploadCloud } from "lucide-react"

import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useAcademicPlan } from "@/components/providers/academic-plan-provider"
import { AnalyzeTranscriptResponse } from "@/types/transcript.type"

/**
 * MIME types accepted by the client-side uploader.
 *
 * The API route should still validate the file independently because
 * browser-provided MIME types can be missing or inaccurate.
 */
const acceptedTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "text/plain",
  "text/csv",
]

/**
 * Maximum transcript size accepted by the upload interface.
 *
 * This limit should remain synchronized with the transcript-analysis API.
 */
const maximumSize = 10 * 1024 * 1024

export default function UploadPage() {
  /**
   * Transcript analysis is stored in the shared academic-plan provider so
   * the review page can access it after client-side navigation.
   */
  const { setTranscriptAnalysis } = useAcademicPlan()

  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  /**
   * Validates the selected file before allowing it to be submitted.
   *
   * This provides immediate feedback but does not replace server-side
   * validation in `/api/transcript/analyze`.
   */
  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0]

    if (!selectedFile) {
      return
    }

    if (!acceptedTypes.includes(selectedFile.type)) {
      setFile(null)
      setError("Upload a PDF, JPG, or PNG transcript.")
      return
    }

    if (selectedFile.size > maximumSize) {
      setFile(null)
      setError("The transcript must be smaller than 10 MB.")
      return
    }

    setError("")
    setFile(selectedFile)
  }

  /**
   * Sends the transcript to the server for extraction, parsing, and
   * normalization.
   *
   * A successful response is placed in shared in-memory state before the user
   * is routed to the transcript-review page.
   */
  async function handleContinue() {
    if (!file) {
      setError("Select a transcript before continuing.")
      return
    }

    try {
      setIsAnalyzing(true)
      setError("")

      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/transcript/analyze", {
        method: "POST",
        body: formData,
      })

      const result = (await response.json()) as AnalyzeTranscriptResponse

      if (!response.ok || !result.success || !result.analysis) {
        throw new Error(result.error ?? "Transcript analysis failed.")
      }

      /**
       * Loading a new transcript replaces the current transcript analysis.
       * The provider should also invalidate any previously generated plan.
       */
      setTranscriptAnalysis(result.analysis)
      router.push("/transcript/review")
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Transcript analysis failed.",
      )
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <AppShell
      title="Upload Transcript"
      description="Start building your personalized academic plan">
      <div className="mx-auto max-w-3xl space-y-6">
        <Card className="p-5 sm:p-8">
          <div className="mx-auto max-w-xl text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <UploadCloud className="size-7" />
            </div>

            <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-950">
              Upload your transcript
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              We will identify your completed coursework and compare it against
              generalized academic requirements.
            </p>
          </div>

          {/*
           * The native file input remains visually hidden. The larger upload
           * surface below opens it through `inputRef`.
           */}
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.txt,.csv"
            className="sr-only"
            onChange={handleFileChange}
          />

          {/*
           * This button acts as the visible file picker and displays the
           * selected file's name and size once one has been chosen.
           */}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-8 flex min-h-56 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition-colors hover:border-slate-500 hover:bg-slate-100">
            {file ? (
              <>
                <FileText className="size-10 text-slate-700" />
                <p className="mt-4 max-w-full truncate font-semibold text-slate-950">
                  {file.name}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </>
            ) : (
              <>
                <UploadCloud className="size-10 text-slate-500" />
                <p className="mt-4 font-semibold text-slate-950">
                  Select your transcript
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  PDF, JPG, or PNG up to 10 MB
                </p>
              </>
            )}
          </button>

          {/*
           * Validation and API errors are shown in the same location so the
           * user has one consistent place to look for upload problems.
           */}
          {error ? (
            <p className="mt-3 text-sm font-medium text-red-600">{error}</p>
          ) : null}

          <Button
            className="mt-6 w-full"
            onClick={handleContinue}
            disabled={isAnalyzing}>
            {isAnalyzing ? "Analyzing..." : "Analyze transcript"}
          </Button>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="p-5">
            <LockKeyhole className="size-5 text-slate-700" />
            <h3 className="mt-3 font-semibold text-slate-950">
              Private by design
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Transcript files should be removed after processing unless the
              user explicitly chooses to save them.
            </p>
          </Card>

          <Card className="p-5">
            <FileText className="size-5 text-slate-700" />
            <h3 className="mt-3 font-semibold text-slate-950">
              Manual entry available
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Students can correct extracted courses or enter their completed
              coursework manually.
            </p>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
