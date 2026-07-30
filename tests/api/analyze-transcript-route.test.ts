import { beforeEach, describe, expect, it, vi } from "vitest"

import { POST } from "@/app/api/transcript/analyze/route"
import { extractPdfText } from "@/lib/transcript/extract-pdf-text"
import { isUsablePdfText } from "@/lib/transcript/is-usable-pdf-text"
import { createTranscriptCourse } from "@/tests/factories/transcript-course.factory"
import { parseTranscriptTextDetailed } from "@/lib/transcript/parse-transcript-text"

vi.mock("@/lib/transcript/extract-pdf-text", () => ({
  extractPdfText: vi.fn(),
}))

vi.mock("@/lib/transcript/is-usable-pdf-text", () => ({
  isUsablePdfText: vi.fn(),
}))

vi.mock("@/lib/transcript/parse-transcript-text", () => ({
  parseTranscriptTextDetailed: vi.fn(),
}))

const mockedExtractPdfText = vi.mocked(extractPdfText)

const mockedIsUsablePdfText = vi.mocked(isUsablePdfText)

const mockedParseTranscriptTextDetailed = vi.mocked(parseTranscriptTextDetailed)

const genericParserWarning =
  "This transcript used the generic course parser. Review course titles, credits, grades, and subject categories before generating a plan."

const genericFallbackWarning =
  "The detected transcript format could not be parsed reliably, so a generic parser was used. Review every course carefully."

function createUploadRequest(file?: File): Request {
  const formData = new FormData()

  if (file) {
    formData.set("file", file)
  }

  return new Request("http://localhost/api/transcript/analyze", {
    method: "POST",
    body: formData,
  })
}

describe("POST /api/transcript/analyze", () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockedIsUsablePdfText.mockReturnValue(true)

    mockedParseTranscriptTextDetailed.mockReturnValue({
      courses: [
        createTranscriptCourse({
          id: "course-1",
          title: "English Composition I",
          subjectArea: "english",
          credits: 3,
          completionStatus: "passed",
          includedInPlan: true,
          source: "extracted",
        }),
      ],
      parserId: "valencia-college",
      detectionScore: 1,
      usedGenericFallback: false,
      warnings: [],
    })

    mockedExtractPdfText.mockResolvedValue({
      text: "English Composition I A 3 credits",
      pageCount: 1,
      characterCount: 33,
    })
  })

  it("rejects a request without a file", async () => {
    const response = await POST(createUploadRequest())

    const payload = await response.json()

    expect(response.status).toBe(400)

    expect(payload).toEqual({
      success: false,
      error: "No transcript file was provided.",
    })
  })

  it("rejects an unsupported file type", async () => {
    const file = new File(["unsupported"], "transcript.docx", {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    })

    const response = await POST(createUploadRequest(file))

    const payload = await response.json()

    expect(response.status).toBe(415)

    expect(payload).toEqual({
      success: false,
      error: "Upload a PDF, JPG, PNG, TXT, or CSV transcript.",
    })
  })

  it("rejects an empty file", async () => {
    const file = new File([], "transcript.txt", {
      type: "text/plain",
    })

    const response = await POST(createUploadRequest(file))

    const payload = await response.json()

    expect(response.status).toBe(422)

    expect(payload).toEqual({
      success: false,
      error: "The uploaded transcript is empty.",
    })
  })

  it("rejects an oversized request using its content-length header", async () => {
    const request = new Request("http://localhost/api/transcript/analyze", {
      method: "POST",
      headers: {
        "content-length": String(12 * 1024 * 1024),
      },
    })

    const response = await POST(request)

    const payload = await response.json()

    expect(response.status).toBe(413)

    expect(payload).toEqual({
      success: false,
      error: "The transcript upload is too large.",
    })
  })

  it("rejects a file larger than 10 MB", async () => {
    const file = new File(
      [new Uint8Array(10 * 1024 * 1024 + 1)],
      "large-transcript.txt",
      {
        type: "text/plain",
      },
    )

    const response = await POST(createUploadRequest(file))

    const payload = await response.json()

    expect(response.status).toBe(413)

    expect(payload).toEqual({
      success: false,
      error: "The transcript must be smaller than 10 MB.",
    })
  })

  it("analyzes a text transcript", async () => {
    const transcriptText = "English Composition I A 3 credits"

    const file = new File([transcriptText], "transcript.txt", {
      type: "text/plain",
    })

    const response = await POST(createUploadRequest(file))

    const payload = await response.json()

    expect(response.status).toBe(200)

    expect(payload.success).toBe(true)

    expect(mockedParseTranscriptTextDetailed).toHaveBeenCalledWith(
      transcriptText,
    )

    expect(payload.analysis).toEqual(
      expect.objectContaining({
        fileName: "transcript.txt",
        fileType: "text",
        educationLevel: "college",
        estimatedCreditsEarned: 3,
        parserId: "valencia-college",
        detectionScore: 1,
        usedGenericFallback: false,
        warnings: [],
      }),
    )

    expect(payload.analysis.courses).toHaveLength(1)

    expect(payload.analysis.id).toEqual(expect.any(String))

    expect(payload.analysis.analyzedAt).toEqual(expect.any(String))
  })

  it("analyzes a CSV transcript", async () => {
    const transcriptText = "English Composition I,A,3 credits"

    const file = new File([transcriptText], "transcript.csv", {
      type: "text/csv",
    })

    const response = await POST(createUploadRequest(file))

    const payload = await response.json()

    expect(response.status).toBe(200)

    expect(payload.success).toBe(true)

    expect(payload.analysis.fileType).toBe("csv")

    expect(mockedParseTranscriptTextDetailed).toHaveBeenCalledWith(
      transcriptText,
    )
  })

  it("returns parser warnings for a generic transcript", async () => {
    mockedParseTranscriptTextDetailed.mockReturnValue({
      courses: [
        createTranscriptCourse({
          id: "course-1",
          title: "Introduction to Programming",
          subjectArea: "computer_science",
          credits: 4,
          completionStatus: "passed",
          includedInPlan: true,
          source: "extracted",
        }),
      ],
      parserId: "generic-course-row",
      detectionScore: 0.1,
      usedGenericFallback: false,
      warnings: [genericParserWarning],
    })

    const file = new File(
      ["CS 101 Introduction to Programming 4.00 A"],
      "unknown-school.txt",
      {
        type: "text/plain",
      },
    )

    const response = await POST(createUploadRequest(file))

    const payload = await response.json()

    expect(response.status).toBe(200)

    expect(payload.analysis.parserId).toBe("generic-course-row")

    expect(payload.analysis.detectionScore).toBe(0.1)

    expect(payload.analysis.usedGenericFallback).toBe(false)

    expect(payload.analysis.warnings).toEqual([genericParserWarning])
  })

  it("returns a warning when generic fallback was required", async () => {
    mockedParseTranscriptTextDetailed.mockReturnValue({
      courses: [
        createTranscriptCourse({
          id: "course-1",
          title: "College Algebra",
          subjectArea: "mathematics",
          credits: 3,
          completionStatus: "passed",
          includedInPlan: true,
          source: "extracted",
        }),
      ],
      parserId: "generic-course-row",
      detectionScore: 0.8,
      usedGenericFallback: true,
      warnings: [genericFallbackWarning],
    })

    const file = new File(
      ["MATH 120 College Algebra 3.00 B"],
      "fallback-transcript.txt",
      {
        type: "text/plain",
      },
    )

    const response = await POST(createUploadRequest(file))

    const payload = await response.json()

    expect(response.status).toBe(200)

    expect(payload.analysis.usedGenericFallback).toBe(true)

    expect(payload.analysis.warnings).toEqual([genericFallbackWarning])
  })

  it("rejects text with no recognizable courses", async () => {
    mockedParseTranscriptTextDetailed.mockReturnValue({
      courses: [],
      parserId: "generic-course-row",
      detectionScore: 0.1,
      usedGenericFallback: false,
      warnings: [genericParserWarning],
    })

    const file = new File(["Transcript heading only"], "transcript.txt", {
      type: "text/plain",
    })

    const response = await POST(createUploadRequest(file))

    const payload = await response.json()

    expect(response.status).toBe(422)

    expect(payload).toEqual({
      success: false,
      error: "No recognizable course rows were found in the file.",
    })
  })

  it("analyzes a selectable-text PDF", async () => {
    const file = new File(["fake-pdf"], "transcript.pdf", {
      type: "application/pdf",
    })

    const response = await POST(createUploadRequest(file))

    const payload = await response.json()

    expect(response.status).toBe(200)

    expect(payload.success).toBe(true)

    expect(payload.analysis.fileType).toBe("pdf")

    expect(mockedExtractPdfText).toHaveBeenCalledOnce()

    const [uploadedFile] = mockedExtractPdfText.mock.calls[0]

    expect(uploadedFile).toBeInstanceOf(File)

    expect(uploadedFile).toMatchObject({
      name: "transcript.pdf",
      type: "application/pdf",
      size: file.size,
    })

    expect(await uploadedFile.text()).toBe(await file.text())

    expect(mockedIsUsablePdfText).toHaveBeenCalledWith(
      "English Composition I A 3 credits",
    )

    expect(mockedParseTranscriptTextDetailed).toHaveBeenCalledWith(
      "English Composition I A 3 credits",
    )

    expect(payload.analysis.warnings).toEqual([
      "Extracted selectable text from 1 PDF page. Review every detected course before generating a plan.",
    ])
  })

  it("combines parser warnings with the PDF review warning", async () => {
    mockedParseTranscriptTextDetailed.mockReturnValue({
      courses: [
        createTranscriptCourse({
          id: "course-1",
          title: "Introduction to Programming",
          subjectArea: "computer_science",
          credits: 4,
          completionStatus: "passed",
          includedInPlan: true,
          source: "extracted",
        }),
      ],
      parserId: "generic-course-row",
      detectionScore: 0.1,
      usedGenericFallback: false,
      warnings: [genericParserWarning],
    })

    const file = new File(["fake-pdf"], "transcript.pdf", {
      type: "application/pdf",
    })

    const response = await POST(createUploadRequest(file))

    const payload = await response.json()

    expect(response.status).toBe(200)

    expect(payload.analysis.warnings).toEqual([
      genericParserWarning,
      "Extracted selectable text from 1 PDF page. Review every detected course before generating a plan.",
    ])
  })

  it("uses plural wording for a multi-page PDF", async () => {
    mockedExtractPdfText.mockResolvedValue({
      text: "English Composition I A 3 credits",
      pageCount: 2,
      characterCount: 33,
    })

    const file = new File(["fake-pdf"], "transcript.pdf", {
      type: "application/pdf",
    })

    const response = await POST(createUploadRequest(file))

    const payload = await response.json()

    expect(response.status).toBe(200)

    expect(payload.analysis.warnings).toEqual([
      "Extracted selectable text from 2 PDF pages. Review every detected course before generating a plan.",
    ])
  })

  it("rejects a PDF without enough selectable text", async () => {
    mockedIsUsablePdfText.mockReturnValue(false)

    const file = new File(["fake-pdf"], "scan.pdf", {
      type: "application/pdf",
    })

    const response = await POST(createUploadRequest(file))

    const payload = await response.json()

    expect(response.status).toBe(422)

    expect(payload).toEqual({
      success: false,
      error:
        "This PDF does not contain enough selectable text. It may be a scanned transcript and will require OCR.",
    })

    expect(mockedParseTranscriptTextDetailed).not.toHaveBeenCalled()
  })

  it("rejects extracted PDF text with no recognizable courses", async () => {
    mockedParseTranscriptTextDetailed.mockReturnValue({
      courses: [],
      parserId: "valencia-college",
      detectionScore: 1,
      usedGenericFallback: false,
      warnings: [],
    })

    const file = new File(["fake-pdf"], "transcript.pdf", {
      type: "application/pdf",
    })

    const response = await POST(createUploadRequest(file))

    const payload = await response.json()

    expect(response.status).toBe(422)

    expect(payload).toEqual({
      success: false,
      error:
        "Text was extracted from the PDF, but no recognizable course rows were found.",
    })
  })

  it("rejects image transcripts until OCR is implemented", async () => {
    const file = new File(["fake-image"], "transcript.png", {
      type: "image/png",
    })

    const response = await POST(createUploadRequest(file))

    const payload = await response.json()

    expect(response.status).toBe(422)

    expect(payload).toEqual({
      success: false,
      error:
        "Image transcript analysis is not implemented yet. Upload a selectable-text PDF, TXT, or CSV file.",
    })

    expect(mockedParseTranscriptTextDetailed).not.toHaveBeenCalled()
  })

  it("returns a generic server error when analysis fails", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})

    mockedParseTranscriptTextDetailed.mockImplementation(() => {
      throw new Error("Sensitive internal error")
    })

    const file = new File(["transcript text"], "transcript.txt", {
      type: "text/plain",
    })

    const response = await POST(createUploadRequest(file))

    const payload = await response.json()

    expect(response.status).toBe(500)

    expect(payload).toEqual({
      success: false,
      error: "The transcript could not be analyzed.",
    })

    expect(JSON.stringify(payload)).not.toContain("Sensitive internal error")

    consoleError.mockRestore()
  })
})
