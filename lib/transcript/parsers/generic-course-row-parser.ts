import { parseCourseRowLine } from "./course-row-patterns"
import type { TranscriptParser } from "./transcript-parser.type"
import {
  deduplicateExtractedRows,
  normalizeTranscriptLine,
  shouldDiscardExtractedRow,
} from "./parser-utils"

/**
 * Generic parser for common one-line transcript course layouts.
 */
export const genericCourseRowParser: TranscriptParser = {
  id: "generic-course-row",

  detect() {
    /**
     * The generic parser is always available but should lose to any
     * institution profile with a meaningful detection score.
     */
    return 0.1
  },

  parse(text) {
    const rows = text
      .split(/\r?\n/)
      .map(normalizeTranscriptLine)
      .map((line) =>
        parseCourseRowLine({
          line,
          parserId: "generic-course-row",
          baseConfidence: 0.1,
        }),
      )
      .filter((row) => row !== null)
      .filter((row) => row.confidence >= 0.5)
      .filter((row) => !shouldDiscardExtractedRow(row))

    return deduplicateExtractedRows(rows)
  },
}

/**
 * Compatibility helper for existing parser tests.
 */
export function isLikelyTranscriptCourseLine(line: string): boolean {
  const row = parseCourseRowLine({
    line,
    parserId: "generic-course-row",
    baseConfidence: 0.1,
  })

  return row !== null && !shouldDiscardExtractedRow(row)
}
