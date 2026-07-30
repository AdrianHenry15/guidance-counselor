import { randomUUID } from "node:crypto"

import { classifyCourse } from "@/lib/transcript/classification/classify-course"
import type { ExtractedCourseRow } from "@/lib/transcript/parsers/extracted-course-row.type"
import {
  parseTranscriptRows,
  parseTranscriptRowsDetailed,
} from "@/lib/transcript/parsers/parser-registry"
import type {
  TranscriptCompletionStatus,
  TranscriptCourse,
  TranscriptParserId,
} from "@/types/transcript.type"

export interface ParsedTranscriptResult {
  courses: TranscriptCourse[]
  parserId: TranscriptParserId
  detectionScore: number
  usedGenericFallback: boolean
  warnings: string[]
}

/**
 * Converts a transcript grade into the application's completion state.
 */
function getCompletionStatus(
  grade: string | undefined,
): TranscriptCompletionStatus {
  if (!grade) {
    return "unknown"
  }

  const normalizedGrade = grade.toUpperCase()

  if (normalizedGrade === "W") {
    return "withdrawn"
  }

  if (normalizedGrade === "F" || normalizedGrade === "U") {
    return "failed"
  }

  if (normalizedGrade === "IP") {
    return "in_progress"
  }

  if (normalizedGrade === "N" || normalizedGrade === "X") {
    return "unknown"
  }

  return "passed"
}

/**
 * Converts internal extracted rows into the application's TranscriptCourse
 * model.
 */
function convertRowsToCourses(rows: ExtractedCourseRow[]): TranscriptCourse[] {
  return rows.map((row): TranscriptCourse => {
    const classification = classifyCourse({
      courseCode: row.courseCode,
      title: row.title,
    })

    const completionStatus = getCompletionStatus(row.grade)

    const originalName = [row.courseCode, row.title].filter(Boolean).join(" ")

    return {
      id: randomUUID(),
      originalName,
      normalizedTitle: classification.normalizedTitle,
      subjectArea: classification.subjectArea,
      source: "extracted",
      credits: row.credits ?? 0,
      grade: row.grade,
      completionStatus,
      includedInPlan: completionStatus === "passed",
      confidence: row.confidence,
    }
  })
}

/**
 * Compatibility parser used by existing application code and tests.
 */
export function parseTranscriptText(text: string): TranscriptCourse[] {
  return convertRowsToCourses(parseTranscriptRows(text))
}

/**
 * Parses transcript text and includes diagnostic information for the API.
 */
export function parseTranscriptTextDetailed(
  text: string,
): ParsedTranscriptResult {
  const parsed = parseTranscriptRowsDetailed(text)

  const courses = convertRowsToCourses(parsed.rows)

  const warnings: string[] = []

  if (parsed.usedGenericFallback) {
    warnings.push(
      "The detected transcript format could not be parsed reliably, so a generic parser was used. Review every course carefully.",
    )
  } else if (parsed.parserId === "generic-course-row") {
    warnings.push(
      "This transcript used the generic course parser. Review course titles, credits, grades, and subject categories before generating a plan.",
    )
  }

  const lowerConfidenceCourseCount = courses.filter(
    (course) => course.confidence < 0.75,
  ).length

  if (lowerConfidenceCourseCount > 0) {
    warnings.push(
      `${lowerConfidenceCourseCount} ${
        lowerConfidenceCourseCount === 1 ? "course has" : "courses have"
      } lower extraction confidence and should be reviewed.`,
    )
  }

  return {
    courses,
    parserId: parsed.parserId as TranscriptParserId,
    detectionScore: parsed.detectionScore,
    usedGenericFallback: parsed.usedGenericFallback,
    warnings,
  }
}

export { isLikelyTranscriptCourseLine } from "./parsers/generic-course-row-parser"
