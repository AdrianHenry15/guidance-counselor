/**
 * Normalized result returned after extracting selectable text from a PDF.
 */
interface PdfTextExtractionResult {
  text: string
  pageCount: number
  characterCount: number
}

/**
 * Narrows an unknown PDF.js content item to the text-item shape used by this
 * extractor.
 */
function isTextItem(item: unknown): item is {
  str: string
  hasEOL?: boolean
} {
  return (
    typeof item === "object" &&
    item !== null &&
    "str" in item &&
    typeof item.str === "string"
  )
}

/**
 * Extracts selectable text from a PDF file using PDF.js.
 *
 * This function does not perform OCR.
 */
export async function extractPdfText(
  file: File,
): Promise<PdfTextExtractionResult> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs")

  const arrayBuffer = await file.arrayBuffer()
  const data = new Uint8Array(arrayBuffer)

  const loadingTask = pdfjs.getDocument({
    data,
  })

  try {
    const document = await loadingTask.promise
    const pages: string[] = []

    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber)

      try {
        const content = await page.getTextContent()

        const pageLines: string[] = []
        let currentLine = ""

        for (const item of content.items) {
          if (!isTextItem(item)) {
            continue
          }

          const value = item.str.trim()

          if (!value) {
            continue
          }

          currentLine = currentLine ? `${currentLine} ${value}` : value

          if (item.hasEOL) {
            pageLines.push(currentLine.trim())
            currentLine = ""
          }
        }

        if (currentLine.trim()) {
          pageLines.push(currentLine.trim())
        }

        pages.push(pageLines.join("\n"))
      } finally {
        page.cleanup()
      }
    }

    const text = pages
      .filter(Boolean)
      .join("\n\n")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim()

    return {
      text,
      pageCount: document.numPages,
      characterCount: text.length,
    }
  } finally {
    await loadingTask.destroy()
  }
}
