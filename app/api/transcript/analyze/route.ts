// app/api/transcript/analyze/route.ts

import { randomUUID } from "crypto"
import { NextResponse } from "next/server"

import { extractPdfText } from "@/lib/transcript/extract-pdf-text"
import { isUsablePdfText } from "@/lib/transcript/is-usable-pdf-text"
import { parseTranscriptText } from "@/lib/transcript/parse-transcript-text"
import type {
  AnalyzeTranscriptResponse,
  TranscriptAnalysis,
  TranscriptCourse,
  TranscriptFileType,
} from "@/types/transcript.type"

export const runtime = "nodejs"

function getFileType(file: File): TranscriptFileType {
  if (
    file.type === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf")
  ) {
    return "pdf"
  }

  if (file.type.startsWith("image/")) {
    return "image"
  }

  if (file.type === "text/csv" || file.name.toLowerCase().endsWith(".csv")) {
    return "csv"
  }

  return "text"
}

export async function POST(
  request: Request,
): Promise<NextResponse<AnalyzeTranscriptResponse>> {
  try {
    const formData = await request.formData()

    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: "No transcript file was provided.",
        },
        {
          status: 400,
        },
      )
    }

    const maximumFileSize = 10 * 1024 * 1024

    if (file.size > maximumFileSize) {
      return NextResponse.json(
        {
          success: false,
          error: "The transcript must be smaller than 10 MB.",
        },
        {
          status: 413,
        },
      )
    }

    const fileType = getFileType(file)

    let courses: TranscriptCourse[] = []
    const warnings: string[] = []

    if (fileType === "text" || fileType === "csv") {
      const text = await file.text()

      courses = parseTranscriptText(text)

      if (!courses.length) {
        return NextResponse.json(
          {
            success: false,
            error: "No recognizable course rows were found in the file.",
          },
          {
            status: 422,
          },
        )
      }
    } else if (fileType === "pdf") {
      const extraction = await extractPdfText(file)

      console.log("PDF extraction result:", {
        fileName: file.name,
        pageCount: extraction.pageCount,
        characterCount: extraction.characterCount,
        preview: extraction.text.slice(0, 500),
      })

      if (!isUsablePdfText(extraction.text)) {
        return NextResponse.json(
          {
            success: false,
            error:
              "This PDF does not contain enough selectable text. It may be a scanned transcript and will require OCR.",
          },
          {
            status: 422,
          },
        )
      }

      courses = parseTranscriptText(extraction.text)

      if (!courses.length) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Text was extracted from the PDF, but no recognizable course rows were found.",
          },
          {
            status: 422,
          },
        )
      }

      warnings.push(
        `Extracted selectable text from ${extraction.pageCount} PDF ${
          extraction.pageCount === 1 ? "page" : "pages"
        }. Review every detected course before generating a plan.`,
      )
    } else {
      return NextResponse.json(
        {
          success: false,
          error:
            "Image transcript analysis is not implemented yet. Upload a selectable-text PDF, TXT, or CSV file.",
        },
        {
          status: 422,
        },
      )
    }

    const earnedCredits = courses
      .filter(
        (course) =>
          course.completionStatus === "passed" && course.includedInPlan,
      )
      .reduce((total, course) => total + course.credits, 0)

    const analysis: TranscriptAnalysis = {
      id: randomUUID(),
      fileName: file.name,
      fileType,
      educationLevel: "college",
      estimatedCreditsEarned: earnedCredits,
      courses,
      warnings,
      analyzedAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      analysis,
    })
  } catch (error) {
    console.error("Transcript analysis failed:", error)

    return NextResponse.json(
      {
        success: false,
        error: "The transcript could not be analyzed.",
      },
      {
        status: 500,
      },
    )
  }
}
