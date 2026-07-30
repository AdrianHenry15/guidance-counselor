import type { SubjectArea } from "@/types/academic.type"

interface NormalizedCourseResult {
  normalizedTitle: string
  subjectArea: SubjectArea
}

interface NormalizationRule {
  patterns: RegExp[]
  result: NormalizedCourseResult
}

interface SubjectClassificationRule {
  patterns: RegExp[]
  subjectArea: SubjectArea
}

/**
 * Exact course mappings.
 *
 * These rules replace known institution-specific or alternate course names
 * with the generalized title used by the planner.
 */
const normalizationRules: NormalizationRule[] = [
  {
    patterns: [
      /english composition i\b/i,
      /composition 1\b/i,
      /freshman composition i\b/i,
      /freshman comp i\b/i,
      /freshman comp 1\b/i,
      /enc\s*1101/i,
      /^(?:english\s+(?:composition|comp)|freshman\s+(?:composition|comp))\s*(?:i|1)$/i,
    ],
    result: {
      normalizedTitle: "English Composition I",
      subjectArea: "english",
    },
  },
  {
    patterns: [
      /english composition ii\b/i,
      /composition 2\b/i,
      /freshman composition ii\b/i,
      /freshman comp ii\b/i,
      /freshman comp 2\b/i,
      /enc\s*1102/i,
    ],
    result: {
      normalizedTitle: "English Composition II",
      subjectArea: "english",
    },
  },
  {
    patterns: [
      /english composition ii\b/i,
      /composition 2\b/i,
      /freshman composition ii\b/i,
      /freshman comp ii\b/i,
      /freshman comp 2\b/i,
      /enc\s*1102/i,
    ],
    result: {
      normalizedTitle: "English Composition II",
      subjectArea: "english",
    },
  },
  {
    patterns: [
      /new student experience/i,
      /college success/i,
      /student success/i,
      /first year experience/i,
      /first-year experience/i,
      /sls\s*1122/i,
    ],
    result: {
      normalizedTitle: "College Success",
      subjectArea: "college_success",
    },
  },
  {
    patterns: [/college algebra/i, /mac\s*1105/i],
    result: {
      normalizedTitle: "College Algebra",
      subjectArea: "mathematics",
    },
  },
  {
    patterns: [/calculus i\b/i, /calculus 1\b/i, /mac\s*2311/i],
    result: {
      normalizedTitle: "Calculus I",
      subjectArea: "mathematics",
    },
  },
  {
    patterns: [/calculus ii\b/i, /calculus 2\b/i, /mac\s*2312/i],
    result: {
      normalizedTitle: "Calculus II",
      subjectArea: "mathematics",
    },
  },
  {
    patterns: [
      /intro.*programming/i,
      /programming fundamentals/i,
      /cop\s*1000/i,
      /cop\s*2220/i,
    ],
    result: {
      normalizedTitle: "Introductory Programming",
      subjectArea: "computer_science",
    },
  },
  {
    patterns: [
      /object oriented programming/i,
      /object-oriented programming/i,
      /cop\s*3330/i,
    ],
    result: {
      normalizedTitle: "Object-Oriented Programming",
      subjectArea: "computer_science",
    },
  },
  {
    patterns: [
      /data structures/i,
      /data structures.*algorithms/i,
      /cop\s*3530/i,
    ],
    result: {
      normalizedTitle: "Data Structures and Algorithms",
      subjectArea: "computer_science",
    },
  },
  {
    patterns: [/biology/i, /general biology/i, /bio\s*\d+/i],
    result: {
      normalizedTitle: "Laboratory Science",
      subjectArea: "science",
    },
  },
  {
    patterns: [/psychology/i, /sociology/i, /economics/i, /political science/i],
    result: {
      normalizedTitle: "Social Science Elective",
      subjectArea: "social_science",
    },
  },
  {
    patterns: [
      /humanities/i,
      /philosophy/i,
      /literature/i,
      /art appreciation/i,
    ],
    result: {
      normalizedTitle: "Humanities Elective",
      subjectArea: "humanities",
    },
  },
]

/**
 * Broader subject classification.
 *
 * These rules assign the correct subject area while preserving the actual
 * transcript title. They run only when no exact normalization rule matched.
 */
const subjectClassificationRules: SubjectClassificationRule[] = [
  {
    patterns: [
      /\btrigonometry\b/i,
      /\bprecalculus\b/i,
      /\bpre-calculus\b/i,
      /\bcalculus\b/i,
      /\balgebra\b/i,
      /\bgeometry\b/i,
      /\bstatistics\b/i,
      /\bprobability\b/i,
      /\bdiscrete mathematics\b/i,
      /\blinear algebra\b/i,
      /\bquantitative reasoning\b/i,
    ],
    subjectArea: "mathematics",
  },
  {
    patterns: [
      /\bitalian\b/i,
      /\bspanish\b/i,
      /\bfrench\b/i,
      /\bgerman\b/i,
      /\bportuguese\b/i,
      /\blatin\b/i,
      /\barabic\b/i,
      /\bjapanese\b/i,
      /\bkorean\b/i,
      /\bmandarin\b/i,
      /\bchinese\b/i,
      /\bamerican sign language\b/i,
      /\b(?:asl)\b/i,
    ],
    subjectArea: "foreign_language",
  },
]

/**
 * Converts a transcript course name into a generalized planner course.
 */
export function normalizeCourseName(
  originalName: string,
): NormalizedCourseResult {
  const trimmedName = originalName.replace(/\s+/g, " ").trim()

  const normalizationMatch = normalizationRules.find((rule) =>
    rule.patterns.some((pattern) => pattern.test(trimmedName)),
  )

  if (normalizationMatch) {
    return normalizationMatch.result
  }

  const classificationMatch = subjectClassificationRules.find((rule) =>
    rule.patterns.some((pattern) => pattern.test(trimmedName)),
  )

  if (classificationMatch) {
    return {
      normalizedTitle: trimmedName,
      subjectArea: classificationMatch.subjectArea,
    }
  }

  /**
   * Unknown courses remain editable and default to general elective credit.
   */
  return {
    normalizedTitle: trimmedName,
    subjectArea: "general_elective",
  }
}
