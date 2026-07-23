// lib/transcript/parse-transcript-text.ts

import { randomUUID } from "crypto"

import type { TranscriptCourse } from "@/types/transcript.type"

import { normalizeCourseName } from "./normalize-course"

const gradePattern = /\b(A\+|A-|A|B\+|B-|B|C\+|C-|C|D\+|D-|D|F|P|S|U|W)\b/i

const creditPattern = /\b([0-9](?:\.[0-9])?)\s*(?:credits?|hrs?|hours?)\b/i

function isPassingGrade(grade?: string): boolean {
  if (!grade) {
    return true
  }

  return !["F", "U", "W"].includes(grade.toUpperCase())
}

export function parseTranscriptText(text: string): TranscriptCourse[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length >= 4)
    .map((line) => {
      const grade = line.match(gradePattern)?.[1]?.toUpperCase()

      const creditsMatch = line.match(creditPattern)

      const credits = creditsMatch ? Number(creditsMatch[1]) : 3

      const courseName = line
        .replace(gradePattern, "")
        .replace(creditPattern, "")
        .replace(/\s{2,}/g, " ")
        .trim()

      const normalized = normalizeCourseName(courseName)

      return {
        id: randomUUID(),
        originalName: courseName,
        normalizedTitle: normalized.normalizedTitle,
        subjectArea: normalized.subjectArea,
        credits,
        grade,
        completed: isPassingGrade(grade),
        confidence: normalized.normalizedTitle === courseName ? 0.55 : 0.9,
      }
    })
    .filter((course) => course.originalName.length > 0)
}
