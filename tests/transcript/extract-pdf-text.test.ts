import { beforeEach, describe, expect, it, vi } from "vitest"

import { extractPdfText } from "@/lib/transcript/extract-pdf-text"
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs"

vi.mock("pdfjs-dist/legacy/build/pdf.mjs", () => ({
  getDocument: vi.fn(),
}))

const mockedGetDocument = vi.mocked(getDocument)

interface FakePdfPage {
  getTextContent: ReturnType<typeof vi.fn>
  cleanup: ReturnType<typeof vi.fn>
}

interface FakePdfDocument {
  numPages: number
  getPage: ReturnType<typeof vi.fn>
}

/**
 * Configures the mocked PDF.js loading task.
 */
function mockPdfDocument(
  document: FakePdfDocument,
  destroy = vi.fn().mockResolvedValue(undefined),
) {
  mockedGetDocument.mockReturnValue({
    promise: Promise.resolve(document),
    destroy,
  } as unknown as ReturnType<typeof getDocument>)

  return {
    destroy,
  }
}

function createPdfFile(): File {
  return new File([new Uint8Array([1, 2, 3])], "transcript.pdf", {
    type: "application/pdf",
  })
}

describe("extractPdfText", () => {
  beforeEach(() => {
    mockedGetDocument.mockReset()
  })

  it("extracts text from one PDF page", async () => {
    const cleanup = vi.fn()

    const page: FakePdfPage = {
      getTextContent: vi.fn().mockResolvedValue({
        items: [
          {
            str: "English",
          },
          {
            str: "Composition I",
            hasEOL: true,
          },
          {
            str: "A",
          },
          {
            str: "3 credits",
            hasEOL: true,
          },
        ],
      }),
      cleanup,
    }

    const document: FakePdfDocument = {
      numPages: 1,
      getPage: vi.fn().mockResolvedValue(page),
    }

    const { destroy } = mockPdfDocument(document)

    const result = await extractPdfText(createPdfFile())

    const expectedText = "English Composition I\nA 3 credits"

    expect(result).toEqual({
      text: expectedText,
      pageCount: 1,
      characterCount: expectedText.length,
    })

    expect(document.getPage).toHaveBeenCalledWith(1)

    expect(cleanup).toHaveBeenCalledOnce()
    expect(destroy).toHaveBeenCalledOnce()
  })

  it("combines text from multiple pages", async () => {
    const firstPageCleanup = vi.fn()
    const secondPageCleanup = vi.fn()

    const firstPage: FakePdfPage = {
      getTextContent: vi.fn().mockResolvedValue({
        items: [
          {
            str: "English Composition I",
            hasEOL: true,
          },
          {
            str: "A 3 credits",
            hasEOL: true,
          },
        ],
      }),
      cleanup: firstPageCleanup,
    }

    const secondPage: FakePdfPage = {
      getTextContent: vi.fn().mockResolvedValue({
        items: [
          {
            str: "College Algebra",
            hasEOL: true,
          },
          {
            str: "B 3 credits",
            hasEOL: true,
          },
        ],
      }),
      cleanup: secondPageCleanup,
    }

    const document: FakePdfDocument = {
      numPages: 2,
      getPage: vi
        .fn()
        .mockResolvedValueOnce(firstPage)
        .mockResolvedValueOnce(secondPage),
    }

    const { destroy } = mockPdfDocument(document)

    const result = await extractPdfText(createPdfFile())

    expect(result.text).toBe(
      [
        "English Composition I",
        "A 3 credits",
        "",
        "College Algebra",
        "B 3 credits",
      ].join("\n"),
    )

    expect(result.pageCount).toBe(2)

    expect(document.getPage).toHaveBeenNthCalledWith(1, 1)

    expect(document.getPage).toHaveBeenNthCalledWith(2, 2)

    expect(firstPageCleanup).toHaveBeenCalledOnce()

    expect(secondPageCleanup).toHaveBeenCalledOnce()

    expect(destroy).toHaveBeenCalledOnce()
  })

  it("ignores non-text and blank content items", async () => {
    const cleanup = vi.fn()

    const page: FakePdfPage = {
      getTextContent: vi.fn().mockResolvedValue({
        items: [
          {
            str: "   ",
          },
          {
            transform: [1, 0, 0, 1],
          },
          null,
          {
            str: "Calculus I",
            hasEOL: true,
          },
        ],
      }),
      cleanup,
    }

    const document: FakePdfDocument = {
      numPages: 1,
      getPage: vi.fn().mockResolvedValue(page),
    }

    const { destroy } = mockPdfDocument(document)

    const result = await extractPdfText(createPdfFile())

    expect(result.text).toBe("Calculus I")

    expect(result.characterCount).toBe("Calculus I".length)

    expect(cleanup).toHaveBeenCalledOnce()
    expect(destroy).toHaveBeenCalledOnce()
  })

  it("returns empty text when the PDF has no selectable text", async () => {
    const cleanup = vi.fn()

    const page: FakePdfPage = {
      getTextContent: vi.fn().mockResolvedValue({
        items: [],
      }),
      cleanup,
    }

    const document: FakePdfDocument = {
      numPages: 1,
      getPage: vi.fn().mockResolvedValue(page),
    }

    const { destroy } = mockPdfDocument(document)

    const result = await extractPdfText(createPdfFile())

    expect(result).toEqual({
      text: "",
      pageCount: 1,
      characterCount: 0,
    })

    expect(cleanup).toHaveBeenCalledOnce()
    expect(destroy).toHaveBeenCalledOnce()
  })

  it("cleans up the page and loading task when text extraction fails", async () => {
    const extractionError = new Error("Page extraction failed")

    const cleanup = vi.fn()

    const page: FakePdfPage = {
      getTextContent: vi.fn().mockRejectedValue(extractionError),
      cleanup,
    }

    const document: FakePdfDocument = {
      numPages: 1,
      getPage: vi.fn().mockResolvedValue(page),
    }

    const { destroy } = mockPdfDocument(document)

    await expect(extractPdfText(createPdfFile())).rejects.toThrow(
      "Page extraction failed",
    )

    expect(cleanup).toHaveBeenCalledOnce()
    expect(destroy).toHaveBeenCalledOnce()
  })

  it("cleans up and propagates PDF loading errors", async () => {
    const destroy = vi.fn().mockResolvedValue(undefined)

    mockedGetDocument.mockImplementation(
      () =>
        ({
          promise: Promise.reject(new Error("Invalid PDF")),
          destroy,
        }) as unknown as ReturnType<typeof getDocument>,
    )

    await expect(extractPdfText(createPdfFile())).rejects.toThrow("Invalid PDF")

    expect(destroy).toHaveBeenCalledOnce()
  })
})
