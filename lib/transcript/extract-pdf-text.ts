interface PdfTextExtractionResult {
  text: string
  pageCount: number
  characterCount: number
}

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

export async function extractPdfText(
  file: File,
): Promise<PdfTextExtractionResult> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs")

  const arrayBuffer = await file.arrayBuffer()
  const data = new Uint8Array(arrayBuffer)

  const loadingTask = pdfjs.getDocument({
    data,
  })

  const document = await loadingTask.promise
  const pages: string[] = []

  try {
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber)
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

      page.cleanup()
    }
  } finally {
    await document._pdfInfo.destroy()
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
}
