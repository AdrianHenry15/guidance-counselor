import type { ExtractedCourseRow } from "./extracted-course-row.type"
import {
  calculateRowConfidence,
  cleanGrade,
  isTranscriptNoise,
  normalizeTranscriptLine,
  parseCredits,
} from "./parser-utils"

const gradeToken = String.raw`(?:A\+|A-|A|B\+|B-|B|C\+|C-|C|D\+|D-|D|F|IP|P|S|U|W|N|X)`

const coursePrefixToken = String.raw`[A-Z]{2,8}`
const courseNumberToken = String.raw`\d{3,5}[A-Z]?`

const codeTitleCreditsGradePattern = new RegExp(
  String.raw`^(${coursePrefixToken})\s*[- ]?\s*(${courseNumberToken})\s+(.+?)\s+(\d{1,2}(?:\.\d{1,3})?)\s+(\*?${gradeToken})(?:\s+\d+(?:\.\d{1,3})?)?$`,
  "i",
)

const codeTitleGradeCreditsPattern = new RegExp(
  String.raw`^(${coursePrefixToken})\s*[- ]?\s*(${courseNumberToken})\s+(.+?)\s+(\*?${gradeToken})\s+(\d{1,2}(?:\.\d{1,3})?)(?:\s+(?:credits?|hrs?|hours?))?(?:\s+\d+(?:\.\d{1,3})?)?$`,
  "i",
)

const codeTitleCreditsOnlyPattern = new RegExp(
  String.raw`^(${coursePrefixToken})\s*[- ]?\s*(${courseNumberToken})\s+(.+?)\s+(\d{1,2}(?:\.\d{1,3})?)(?:\s+(?:credits?|hrs?|hours?))?$`,
  "i",
)

const codeTitleGradeOnlyPattern = new RegExp(
  String.raw`^(${coursePrefixToken})\s*[- ]?\s*(${courseNumberToken})\s+(.+?)\s+(\*?${gradeToken})$`,
  "i",
)

const titleGradeCreditsPattern = new RegExp(
  String.raw`^(.+?)\s+(\*?${gradeToken})\s+(\d{1,2}(?:\.\d{1,3})?)\s*(?:credits?|hrs?|hours?)$`,
  "i",
)

const titleCreditsGradePattern = new RegExp(
  String.raw`^(.+?)\s+(\d{1,2}(?:\.\d{1,3})?)\s*(?:credits?|hrs?|hours?)\s+(\*?${gradeToken})$`,
  "i",
)

const titleCreditsOnlyPattern =
  /^(.+?)\s+(\d{1,2}(?:\.\d{1,3})?)\s*(?:credits?|hrs?|hours?)$/i

const titleGradeOnlyPattern = new RegExp(
  String.raw`^(.{3,80}?)\s+(\*?${gradeToken})$`,
  "i",
)

/**
 * Produces a consistently shaped extracted row.
 */
function createExtractedRow({
  parserId,
  rawLine,
  courseCode,
  title,
  credits,
  grade,
  baseConfidence,
}: {
  parserId: string
  rawLine: string
  courseCode?: string
  title: string
  credits?: number
  grade?: string
  baseConfidence: number
}): ExtractedCourseRow {
  const normalizedTitle = title.replace(/\s+/g, " ").trim()
  const normalizedGrade = cleanGrade(grade)

  return {
    parserId,
    rawLine,
    courseCode,
    title: normalizedTitle,
    credits,
    grade: normalizedGrade,
    confidence: calculateRowConfidence({
      baseConfidence,
      courseCode,
      title: normalizedTitle,
      credits,
      grade: normalizedGrade,
    }),
  }
}

/**
 * Restricts weak grade-only rows so transcript prose does not become a course.
 */
function isSafeGradeOnlyTitle(title: string): boolean {
  const wordCount = title.split(/\s+/).length

  if (wordCount > 10) {
    return false
  }

  if (/[.:;]/.test(title)) {
    return false
  }

  return !/\b(?:average|equivalent|grade|gpa|student|degree|program|transcript|credit earned)\b/i.test(
    title,
  )
}

/**
 * Attempts the supported transcript row layouts from strongest to weakest.
 */
export function parseCourseRowLine({
  line,
  parserId,
  baseConfidence = 0.1,
}: {
  line: string
  parserId: string
  baseConfidence?: number
}): ExtractedCourseRow | null {
  const normalizedLine = normalizeTranscriptLine(line)

  if (isTranscriptNoise(normalizedLine)) {
    return null
  }

  let match = normalizedLine.match(codeTitleCreditsGradePattern)

  if (match) {
    const [, prefix, number, title, creditText, grade] = match

    if (!prefix || !number || !title) {
      return null
    }

    return createExtractedRow({
      parserId,
      rawLine: normalizedLine,
      courseCode: `${prefix.toUpperCase()} ${number.toUpperCase()}`,
      title,
      credits: parseCredits(creditText),
      grade,
      baseConfidence,
    })
  }

  match = normalizedLine.match(codeTitleGradeCreditsPattern)

  if (match) {
    const [, prefix, number, title, grade, creditText] = match

    if (!prefix || !number || !title) {
      return null
    }

    return createExtractedRow({
      parserId,
      rawLine: normalizedLine,
      courseCode: `${prefix.toUpperCase()} ${number.toUpperCase()}`,
      title,
      credits: parseCredits(creditText),
      grade,
      baseConfidence,
    })
  }

  match = normalizedLine.match(codeTitleCreditsOnlyPattern)

  if (match) {
    const [, prefix, number, title, creditText] = match

    if (!prefix || !number || !title) {
      return null
    }

    return createExtractedRow({
      parserId,
      rawLine: normalizedLine,
      courseCode: `${prefix.toUpperCase()} ${number.toUpperCase()}`,
      title,
      credits: parseCredits(creditText),
      baseConfidence,
    })
  }

  match = normalizedLine.match(codeTitleGradeOnlyPattern)

  if (match) {
    const [, prefix, number, title, grade] = match

    if (!prefix || !number || !title) {
      return null
    }

    return createExtractedRow({
      parserId,
      rawLine: normalizedLine,
      courseCode: `${prefix.toUpperCase()} ${number.toUpperCase()}`,
      title,
      grade,
      baseConfidence,
    })
  }

  match = normalizedLine.match(titleGradeCreditsPattern)

  if (match) {
    const [, title, grade, creditText] = match

    if (!title) {
      return null
    }

    return createExtractedRow({
      parserId,
      rawLine: normalizedLine,
      title,
      credits: parseCredits(creditText),
      grade,
      baseConfidence,
    })
  }

  match = normalizedLine.match(titleCreditsGradePattern)

  if (match) {
    const [, title, creditText, grade] = match

    if (!title) {
      return null
    }

    return createExtractedRow({
      parserId,
      rawLine: normalizedLine,
      title,
      credits: parseCredits(creditText),
      grade,
      baseConfidence,
    })
  }

  match = normalizedLine.match(titleCreditsOnlyPattern)

  if (match) {
    const [, title, creditText] = match

    if (!title) {
      return null
    }

    return createExtractedRow({
      parserId,
      rawLine: normalizedLine,
      title,
      credits: parseCredits(creditText),
      baseConfidence,
    })
  }

  match = normalizedLine.match(titleGradeOnlyPattern)

  if (match) {
    const [, title, grade] = match

    if (!title || !isSafeGradeOnlyTitle(title)) {
      return null
    }

    return createExtractedRow({
      parserId,
      rawLine: normalizedLine,
      title,
      grade,
      baseConfidence,
    })
  }

  return null
}
