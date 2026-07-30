import { parseCourseRowLine } from "./course-row-patterns"
import type { TranscriptParser } from "./transcript-parser.type"
import {
  deduplicateExtractedRows,
  normalizeTranscriptLine,
  shouldDiscardExtractedRow,
} from "./parser-utils"

const courseSectionStartPatterns = [
  /^transfer credit accepted by the institution\b/i,
  /^institution credit\b/i,
]

const courseSectionEndPatterns = [/transcript totals/i, /end of transcript/i]

/**
 * Parser profile for Valencia College selectable-text transcripts.
 */
export const valenciaTranscriptParser: TranscriptParser = {
  id: "valencia-college",

  detect(text) {
    let score = 0

    if (/valencia college/i.test(text)) {
      score += 0.4
    }

    if (/permanent academic record/i.test(text)) {
      score += 0.25
    }

    if (/prefix\s+no\.\s+course title\s+cred\s+grd/i.test(text)) {
      score += 0.2
    }

    if (/transfer credit accepted by the institution/i.test(text)) {
      score += 0.15
    }

    return Math.min(score, 1)
  },

  parse(text) {
    const rows = []
    const lines = text.split(/\r?\n/).map(normalizeTranscriptLine)

    let insideCourseSection = false

    for (const line of lines) {
      if (courseSectionStartPatterns.some((pattern) => pattern.test(line))) {
        insideCourseSection = true
        continue
      }

      if (
        insideCourseSection &&
        courseSectionEndPatterns.some((pattern) => pattern.test(line))
      ) {
        break
      }

      if (!insideCourseSection) {
        continue
      }

      const row = parseCourseRowLine({
        line,
        parserId: "valencia-college",
        baseConfidence: 0.2,
      })

      if (!row || shouldDiscardExtractedRow(row)) {
        continue
      }

      rows.push(row)
    }

    return deduplicateExtractedRows(rows)
  },
}
