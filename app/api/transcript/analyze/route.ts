import { randomUUID } from "node:crypto"

import { NextResponse } from "next/server"

import { extractPdfText } from "@/lib/transcript/extract-pdf-text"
import { isUsablePdfText } from "@/lib/transcript/is-usable-pdf-text"
import { calculateIncludedCredits } from "@/lib/transcript/transcript-course-utils"
import type {
  AnalyzeTranscriptResponse,
  TranscriptAnalysis,
  TranscriptFileType,
} from "@/types/transcript.type"
import { parseTranscriptTextDetailed } from "@/lib/transcript/parse-transcript-text"

/**
 * PDF extraction requires Node-compatible APIs.
 */
export const runtime = "nodejs"

const maximumFileSize = 10 * 1024 * 1024
const multipartOverheadAllowance = 1024 * 1024

const acceptedMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "text/plain",
  "text/csv",
])

const acceptedExtensions = new Set(["pdf", "jpg", "jpeg", "png", "txt", "csv"])

interface ExtractionMetadata {
  pageCount: number
  characterCount: number
}

/**
 * Returns the lowercase extension without the leading period.
 */
function getFileExtension(file: File): string {
  return file.name.split(".").at(-1)?.toLowerCase() ?? ""
}

/**
 * Checks whether the upload uses a supported MIME type or extension.
 */
function isAcceptedFile(file: File): boolean {
  return (
    acceptedMimeTypes.has(file.type) ||
    acceptedExtensions.has(getFileExtension(file))
  )
}

/**
 * Determines which transcript-processing strategy should be used.
 */
function getFileType(file: File): TranscriptFileType {
  const extension = getFileExtension(file)

  if (file.type === "application/pdf" || extension === "pdf") {
    return "pdf"
  }

  if (
    file.type.startsWith("image/") ||
    ["jpg", "jpeg", "png"].includes(extension)
  ) {
    return "image"
  }

  if (file.type === "text/csv" || extension === "csv") {
    return "csv"
  }

  return "text"
}

/**
 * Extracts and normalizes course data from an uploaded transcript.
 */
export async function POST(
  request: Request,
): Promise<NextResponse<AnalyzeTranscriptResponse>> {
  try {
    /**
     * Reject clearly oversized multipart requests before parsing the body.
     */
    const contentLength = request.headers.get("content-length")

    if (contentLength) {
      const requestSize = Number(contentLength)

      if (
        Number.isFinite(requestSize) &&
        requestSize > maximumFileSize + multipartOverheadAllowance
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "The transcript upload is too large.",
          },
          {
            status: 413,
          },
        )
      }
    }

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

    if (!isAcceptedFile(file)) {
      return NextResponse.json(
        {
          success: false,
          error: "Upload a PDF, JPG, PNG, TXT, or CSV transcript.",
        },
        {
          status: 415,
        },
      )
    }

    if (file.size === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "The uploaded transcript is empty.",
        },
        {
          status: 422,
        },
      )
    }

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

    let extractedText = ""
    let extractionMetadata: ExtractionMetadata | undefined

    const fileWarnings: string[] = []

    if (fileType === "text" || fileType === "csv") {
      extractedText = await file.text()
    } else if (fileType === "pdf") {
      const extraction = await extractPdfText(file)

      extractedText = extraction.text

      extractionMetadata = {
        pageCount: extraction.pageCount,
        characterCount: extraction.characterCount,
      }

      /**
       * Never log transcript text or document previews.
       */
      if (process.env.NODE_ENV === "development") {
        console.info("[pdf-transcript-extraction]", {
          pageCount: extraction.pageCount,
          characterCount: extraction.characterCount,
        })
      }

      if (!isUsablePdfText(extractedText)) {
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

      fileWarnings.push(
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

    const parsedTranscript = parseTranscriptTextDetailed(extractedText)

    const { courses, parserId, detectionScore, usedGenericFallback } =
      parsedTranscript

    if (!courses.length) {
      const error =
        fileType === "pdf"
          ? "Text was extracted from the PDF, but no recognizable course rows were found."
          : "No recognizable course rows were found in the file."

      return NextResponse.json(
        {
          success: false,
          error,
        },
        {
          status: 422,
        },
      )
    }

    const warnings = [...parsedTranscript.warnings, ...fileWarnings]

    const earnedCredits = calculateIncludedCredits(courses)

    const analysis: TranscriptAnalysis = {
      id: randomUUID(),
      fileName: file.name,
      fileType,
      educationLevel: "college",
      estimatedCreditsEarned: earnedCredits,
      courses,
      warnings,
      parserId,
      detectionScore,
      usedGenericFallback,
      analyzedAt: new Date().toISOString(),
    }

    if (process.env.NODE_ENV === "development") {
      console.info("[transcript-analysis]", {
        fileType,
        parserId,
        detectionScore,
        usedGenericFallback,
        courseCount: courses.length,
        warningCount: warnings.length,
        pageCount: extractionMetadata?.pageCount,
        characterCount: extractionMetadata?.characterCount,
      })
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
