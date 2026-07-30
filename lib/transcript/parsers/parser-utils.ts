import type { ExtractedCourseRow } from "./extracted-course-row.type"

/**
 * Common transcript metadata and legend text that must not become courses.
 */
const transcriptNoisePatterns = [
  /^(official\s+)?(?:academic\s+)?transcript\b/i,
  /^permanent academic record\b/i,
  /^transcript legend\b/i,
  /^student(?:\s+name|\s+id)?\b/i,
  /^issued to\b/i,
  /^date issued\b/i,
  /^residency\b/i,
  /^institution\b/i,
  /^current program\b/i,
  /^program\b/i,
  /^major\b/i,
  /^degree\b/i,
  /^degrees granted\b/i,
  /^academic standing\b/i,
  /^academic terms\b/i,
  /^academic achievements\b/i,
  /^accreditation\b/i,
  /^history\b/i,
  /^grading scales?\b/i,
  /^course type\b/i,
  /^transfer credits?\b/i,
  /^repeated courses?\b/i,
  /^incomplete grades?\b/i,
  /^foreign language proficiency\b/i,
  /^copy of transcript\b/i,
  /^president'?s list\b/i,
  /^dean'?s list\b/i,
  /^(fall|spring|summer|winter)\s+\d{4}\b/i,
  /^term\b/i,
  /^semester\b/i,
  /^cumulative\b/i,
  /^overall\b/i,
  /^total\b/i,
  /^earned hrs\b/i,
  /^eh?rs:\b/i,
  /^gpa\b/i,
  /^gpa[-\s]?hrs\b/i,
  /^quality points?\b/i,
  /^qpts:\b/i,
  /^page\s*:?\s*\d+\b/i,
  /^prefix\s+no\./i,
  /^record is not to be released\b/i,
  /^\*+\s*(?:transcript totals|end of transcript)/i,
]

const explicitNoCreditGrades = new Set(["N", "X"])

/**
 * Normalizes PDF, CSV, and TXT separators without altering title words.
 */
export function normalizeTranscriptLine(line: string): string {
  return line
    .replace(/[|\t]+/g, " ")
    .replace(/,\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * Identifies metadata, totals, legends, and other transcript noise.
 */
export function isTranscriptNoise(line: string): boolean {
  const normalizedLine = normalizeTranscriptLine(line)

  if (!normalizedLine) {
    return true
  }

  if (normalizedLine.length > 180) {
    return true
  }

  return transcriptNoisePatterns.some((pattern) => pattern.test(normalizedLine))
}

/**
 * Converts a transcript grade token into its normalized representation.
 */
export function cleanGrade(grade: string | undefined): string | undefined {
  const cleanedGrade = grade?.replace(/^\*/, "").trim().toUpperCase()

  return cleanedGrade || undefined
}

/**
 * Parses and validates a possible credit value.
 */
export function parseCredits(value: string | undefined): number | undefined {
  if (value === undefined) {
    return undefined
  }

  const credits = Number(value)

  if (!Number.isFinite(credits) || credits < 0 || credits > 30) {
    return undefined
  }

  return credits
}

/**
 * Calculates confidence from independent pieces of course-row evidence.
 */
export function calculateRowConfidence({
  baseConfidence,
  courseCode,
  title,
  credits,
  grade,
}: {
  baseConfidence: number
  courseCode?: string
  title: string
  credits?: number
  grade?: string
}): number {
  let confidence = baseConfidence

  if (courseCode) {
    confidence += 0.25
  }

  if (title.trim().length >= 3) {
    confidence += 0.25
  }

  if (credits !== undefined) {
    confidence += 0.25
  }

  if (grade) {
    confidence += 0.15
  }

  return Math.min(Math.max(confidence, 0), 1)
}

/**
 * Removes explicit no-credit records such as "0.00 N".
 *
 * Missing credits remain valid because some transcripts omit the field.
 */
export function shouldDiscardExtractedRow(row: ExtractedCourseRow): boolean {
  if (!row.title.trim()) {
    return true
  }

  return (
    row.credits === 0 &&
    row.grade !== undefined &&
    explicitNoCreditGrades.has(row.grade)
  )
}

/**
 * Deduplicates course rows while retaining the highest-confidence version.
 */
export function deduplicateExtractedRows(
  rows: ExtractedCourseRow[],
): ExtractedCourseRow[] {
  const rowsByKey = new Map<string, ExtractedCourseRow>()

  for (const row of rows) {
    const key = [
      row.courseCode?.toUpperCase() ?? "",
      row.title.toLowerCase(),
      row.credits ?? "missing",
      row.grade ?? "missing",
    ].join("|")

    const existingRow = rowsByKey.get(key)

    if (!existingRow || row.confidence > existingRow.confidence) {
      rowsByKey.set(key, row)
    }
  }

  return [...rowsByKey.values()]
}
