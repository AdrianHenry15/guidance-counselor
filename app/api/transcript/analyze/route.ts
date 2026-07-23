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

/**
 * PDF extraction depends on Node-compatible APIs, so this route must run
 * in the Node.js runtime rather than the Edge runtime.
 */
export const runtime = "nodejs"

/**
 * Determines how the uploaded transcript should be processed.
 *
 * File extensions are checked as a fallback because browser-provided MIME
 * types can occasionally be missing or inaccurate.
 */
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

/**
 * Accepts a transcript upload, extracts readable text, parses course rows,
 * and returns a normalized transcript analysis.
 *
 * Current supported formats:
 *
 * - TXT
 * - CSV
 * - selectable-text PDF
 *
 * Image files and scanned PDFs will require an OCR fallback in a later phase.
 */
export async function POST(
  request: Request,
): Promise<NextResponse<AnalyzeTranscriptResponse>> {
  try {
    /**
     * Transcript files are submitted as multipart form data under the
     * `file` field.
     */
    const formData = await request.formData()

    const file = formData.get("file")

    /**
     * Reject requests that do not contain a valid uploaded File object.
     */
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

    /**
     * Keep the server-side file limit synchronized with the upload page.
     *
     * Client-side validation improves usability, but this server check is
     * required because HTTP requests cannot be trusted.
     */
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

    /**
     * Parsed courses are populated by the extraction strategy appropriate
     * for the uploaded file type.
     */
    let courses: TranscriptCourse[] = []
    /**
     * Warnings communicate non-fatal extraction concerns to the review page.
     */
    const warnings: string[] = []

    if (fileType === "text" || fileType === "csv") {
      /**
       * Plain-text and CSV files can be read directly without an extraction
       * library.
       */
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
      /**
       * Extract selectable text from the PDF before running transcript-row
       * parsing.
       */
      const extraction = await extractPdfText(file)

      /**
       * Temporary development logging helps verify whether PDF extraction
       * preserves readable transcript content.
       *
       * Avoid logging transcript previews in production because transcripts
       * may contain sensitive student information.
       */
      if (process.env.NODE_ENV === "development") {
        console.log("PDF extraction result:", {
          fileName: file.name,
          pageCount: extraction.pageCount,
          characterCount: extraction.characterCount,
          preview: extraction.text.slice(0, 500),
        })
      }

      /**
       * PDFs with very little selectable text are likely scanned documents.
       * Those files should be routed through OCR once that fallback exists.
       */
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

      /**
       * A PDF may contain readable text without using a transcript layout
       * that the current parser recognizes.
       */
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

      /**
       * PDF extraction can alter spacing and line structure, so users should
       * review every detected course before plan generation.
       */
      warnings.push(
        `Extracted selectable text from ${extraction.pageCount} PDF ${
          extraction.pageCount === 1 ? "page" : "pages"
        }. Review every detected course before generating a plan.`,
      )
    } else {
      /**
       * Images are accepted by the upload UI in preparation for OCR support,
       * but they cannot yet be analyzed by the current backend pipeline.
       */
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

    /**
     * Only passed courses that are initially included in planning count
     * toward the estimated earned-credit total.
     */
    const earnedCredits = courses
      .filter(
        (course) =>
          course.completionStatus === "passed" && course.includedInPlan,
      )
      .reduce((total, course) => total + course.credits, 0)

    /**
     * Package the normalized transcript data for the review workflow.
     *
     * The analysis is currently returned directly to the client and stored
     * in in-memory React context. Persistent user storage will be added later.
     */
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
    /**
     * Preserve the original error in server logs while returning a generic
     * message to the client.
     */
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
