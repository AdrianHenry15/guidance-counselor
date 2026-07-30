import { normalizeCourseName } from "@/lib/transcript/normalize-course"
import type { SubjectArea } from "@/types/academic.type"

interface ClassifyCourseArguments {
  courseCode?: string
  title: string
}

interface ClassifiedCourse {
  normalizedTitle: string
  subjectArea: SubjectArea
}

const prefixSubjectMap: Partial<Record<string, SubjectArea>> = {
  ENC: "english",
  ENG: "english",
  WRT: "english",

  MAC: "mathematics",
  MAT: "mathematics",
  MATH: "mathematics",
  STA: "mathematics",

  BIO: "science",
  CHM: "science",
  CHEM: "science",
  PHY: "science",
  AST: "science",
  ESC: "science",

  COP: "computer_science",
  CEN: "computer_science",
  CIS: "computer_science",
  CSC: "computer_science",
  CS: "computer_science",

  SPA: "foreign_language",
  SPN: "foreign_language",
  ITA: "foreign_language",
  ITAL: "foreign_language",
  FRE: "foreign_language",
  FREN: "foreign_language",
  GER: "foreign_language",
  LAT: "foreign_language",
  ARA: "foreign_language",
  JPN: "foreign_language",
  KOR: "foreign_language",
  CHI: "foreign_language",

  PSY: "social_science",
  SOC: "social_science",
  ECO: "social_science",
  POS: "social_science",
  POL: "social_science",

  HUM: "humanities",
  PHI: "humanities",
  LIT: "humanities",

  SLS: "college_success",

  HSC: "health",
  HEA: "health",

  PED: "physical_education",
  HPE: "physical_education",
}

/**
 * Returns the alphabetic prefix from a course code.
 */
function getCoursePrefix(courseCode: string | undefined): string | undefined {
  return courseCode?.match(/^[A-Z]+/i)?.[0]?.toUpperCase()
}

/**
 * Normalizes a known title and classifies unknown titles using supporting
 * course-code evidence.
 */
export function classifyCourse({
  courseCode,
  title,
}: ClassifyCourseArguments): ClassifiedCourse {
  const cleanedTitle = title.replace(/\s+/g, " ").trim()
  const normalized = normalizeCourseName(cleanedTitle)

  const titleWasNormalized =
    normalized.normalizedTitle.toLowerCase() !== cleanedTitle.toLowerCase()

  if (normalized.subjectArea !== "general_elective") {
    return {
      normalizedTitle: titleWasNormalized
        ? normalized.normalizedTitle
        : courseCode
          ? `${courseCode} ${cleanedTitle}`
          : cleanedTitle,
      subjectArea: normalized.subjectArea,
    }
  }

  const prefix = getCoursePrefix(courseCode)
  const prefixSubjectArea = prefix ? prefixSubjectMap[prefix] : undefined

  return {
    normalizedTitle: courseCode
      ? `${courseCode} ${cleanedTitle}`
      : cleanedTitle,
    subjectArea: prefixSubjectArea ?? "general_elective",
  }
}
