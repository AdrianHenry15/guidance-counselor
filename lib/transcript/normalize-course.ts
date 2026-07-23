import type { SubjectArea } from "@/types/academic.type"

interface NormalizedCourseResult {
  normalizedTitle: string
  subjectArea: SubjectArea
}

const normalizationRules: Array<{
  patterns: RegExp[]
  result: NormalizedCourseResult
}> = [
  {
    patterns: [
      /english composition i\b/i,
      /composition 1\b/i,
      /freshman composition i\b/i,
      /enc\s*1101/i,
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
      /enc\s*1102/i,
    ],
    result: {
      normalizedTitle: "English Composition II",
      subjectArea: "english",
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
 * Converts a transcript course name into a generalized planner course.
 */
export function normalizeCourseName(
  originalName: string,
): NormalizedCourseResult {
  const match = normalizationRules.find((rule) =>
    rule.patterns.some((pattern) => pattern.test(originalName)),
  )

  if (match) {
    return match.result
  }

  /**
   * Unknown courses remain editable and default to general elective credit.
   */
  return {
    normalizedTitle: originalName.trim(),
    subjectArea: "general_elective",
  }
}
