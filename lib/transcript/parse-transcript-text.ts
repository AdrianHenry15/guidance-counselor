import { randomUUID } from "crypto"

import type {
  TranscriptCompletionStatus,
  TranscriptCourse,
} from "@/types/transcript.type"

import { normalizeCourseName } from "./normalize-course"

/**
 * Matches supported grades near the end of a transcript row.
 */
const gradePattern =
  /\b(A\+|A-|A|B\+|B-|B|C\+|C-|C|D\+|D-|D|F|P|S|U|W|IP)\b(?=\s*(?:[0-9](?:\.[0-9])?\s*(?:credits?|hrs?|hours?))?\s*$)/i

/**
 * Matches an explicit credit value such as "3 credits" or "4 hrs".
 */
const creditPattern = /\b([0-9](?:\.[0-9])?)\s*(?:credits?|hrs?|hours?)\b/i

/**
 * Converts a parsed grade into the planner's completion status.
 */
function getCompletionStatus(grade?: string): TranscriptCompletionStatus {
  if (!grade) {
    return "unknown"
  }

  const normalizedGrade = grade.toUpperCase()

  if (normalizedGrade === "W") {
    return "withdrawn"
  }

  if (["F", "U"].includes(normalizedGrade)) {
    return "failed"
  }

  if (normalizedGrade === "IP") {
    return "in_progress"
  }

  return "passed"
}

/**
 * Parses transcript text into normalized course records.
 */
export function parseTranscriptText(text: string): TranscriptCourse[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length >= 4)
    .map((line) => {
      const gradeMatch = line.match(gradePattern)

      const grade = gradeMatch?.[1]?.toUpperCase()

      const creditsMatch = line.match(creditPattern)

      const credits = creditsMatch ? Number(creditsMatch[1]) : 0

      /**
       * Remove grade and credit values before normalizing the course name.
       */
      const courseName = line
        .replace(gradePattern, "")
        .replace(creditPattern, "")
        .replace(/\s{2,}/g, " ")
        .trim()

      const normalized = normalizeCourseName(courseName)

      const completionStatus = getCompletionStatus(grade)

      return {
        id: randomUUID(),
        originalName: courseName,
        normalizedTitle: normalized.normalizedTitle,
        subjectArea: normalized.subjectArea,
        credits,
        grade,
        completionStatus,
        includedInPlan: completionStatus === "passed",
        confidence: normalized.normalizedTitle === courseName ? 0.55 : 0.9,
      }
    })
    .filter((course) => course.originalName.length > 0)
}
