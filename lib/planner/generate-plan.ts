import { randomUUID } from "crypto"

import type {
  AcademicTerm,
  GeneralizedCourse,
  PlannedCourse,
  PlannedSemester,
  StudentAcademicPlan,
} from "@/types/academic.type"
import type { AcademicProgram } from "@/types/degree.type"
import type { GeneratePlanOptions } from "@/types/planner.type"
import type { TranscriptCourse } from "@/types/transcript.type"

interface GenerateAcademicPlanArguments {
  program: AcademicProgram
  transcriptCourses: TranscriptCourse[]
  options: GeneratePlanOptions
}

function normalizeComparisonValue(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "")
}

function courseMatchesTranscript(
  course: GeneralizedCourse,
  transcriptCourse: TranscriptCourse,
): boolean {
  const plannedTitle = normalizeComparisonValue(course.title)

  const normalizedTranscriptTitle = normalizeComparisonValue(
    transcriptCourse.normalizedTitle,
  )

  const originalTranscriptTitle = normalizeComparisonValue(
    transcriptCourse.originalName,
  )

  if (plannedTitle === normalizedTranscriptTitle) {
    return true
  }

  if (
    normalizedTranscriptTitle.includes(plannedTitle) ||
    plannedTitle.includes(normalizedTranscriptTitle)
  ) {
    return true
  }

  return originalTranscriptTitle.includes(plannedTitle)
}

function gatherRequiredCourses(program: AcademicProgram): GeneralizedCourse[] {
  return program.requirements.flatMap(
    (requirement) => requirement.courseOptions ?? [],
  )
}

function getRemainingCourses(
  requiredCourses: GeneralizedCourse[],
  transcriptCourses: TranscriptCourse[],
): GeneralizedCourse[] {
  const includedTranscriptCourses = transcriptCourses.filter(
    (course) => course.completed,
  )

  return requiredCourses.filter((requiredCourse) => {
    return !includedTranscriptCourses.some((transcriptCourse) =>
      courseMatchesTranscript(requiredCourse, transcriptCourse),
    )
  })
}

function prerequisitesAreSatisfied(
  course: GeneralizedCourse,
  completedCourseIds: Set<string>,
): boolean {
  if (!course.prerequisites?.length) {
    return true
  }

  return course.prerequisites.every((prerequisiteId) =>
    completedCourseIds.has(prerequisiteId),
  )
}

function getNextTerm(
  term: AcademicTerm,
  year: number,
  includeSummer: boolean,
): {
  term: AcademicTerm
  year: number
} {
  if (term === "fall") {
    return {
      term: "spring",
      year: year + 1,
    }
  }

  if (term === "spring") {
    if (includeSummer) {
      return {
        term: "summer",
        year,
      }
    }

    return {
      term: "fall",
      year,
    }
  }

  return {
    term: "fall",
    year,
  }
}

function formatSemesterLabel(term: AcademicTerm, year: number): string {
  const termLabel = term.charAt(0).toUpperCase() + term.slice(1)

  return `${termLabel} ${year}`
}

function getCreditTarget(
  term: AcademicTerm,
  options: GeneratePlanOptions,
): number {
  if (term === "summer") {
    return options.summerCreditTarget
  }

  return options.fallSpringCreditTarget
}

function createPlannedCourse(course: GeneralizedCourse): PlannedCourse {
  return {
    ...course,
    status: "planned",
    source: "degree_requirement",
  }
}

function calculateEstimatedGraduation(
  semesters: PlannedSemester[],
): string | undefined {
  const finalSemester = semesters.at(-1)

  return finalSemester?.label
}

export function generateAcademicPlan({
  program,
  transcriptCourses,
  options,
}: GenerateAcademicPlanArguments): StudentAcademicPlan {
  const includedTranscriptCourses = transcriptCourses.filter(
    (course) => course.completed,
  )

  const completedCredits = includedTranscriptCourses.reduce(
    (total, course) => total + course.credits,
    0,
  )

  const requiredCourses = gatherRequiredCourses(program)

  const remainingCourses = getRemainingCourses(
    requiredCourses,
    includedTranscriptCourses,
  )

  const completedCourseIds = new Set<string>()

  for (const requiredCourse of requiredCourses) {
    const completed = includedTranscriptCourses.some((transcriptCourse) =>
      courseMatchesTranscript(requiredCourse, transcriptCourse),
    )

    if (completed) {
      completedCourseIds.add(requiredCourse.id)
    }
  }

  const unscheduledCourses = [...remainingCourses]
  const semesters: PlannedSemester[] = []

  let currentTerm: AcademicTerm = options.startTerm
  let currentYear = options.startYear

  let safetyCounter = 0
  const maximumSemesters = 20

  while (unscheduledCourses.length > 0 && safetyCounter < maximumSemesters) {
    safetyCounter += 1

    const creditTarget = getCreditTarget(currentTerm, options)

    const semesterCourses: PlannedCourse[] = []
    let semesterCredits = 0

    const availableCourses = unscheduledCourses.filter((course) =>
      prerequisitesAreSatisfied(course, completedCourseIds),
    )

    for (const course of availableCourses) {
      const wouldExceedTarget = semesterCredits + course.credits > creditTarget

      if (wouldExceedTarget && semesterCourses.length > 0) {
        continue
      }

      semesterCourses.push(createPlannedCourse(course))

      semesterCredits += course.credits

      if (semesterCredits >= creditTarget) {
        break
      }
    }

    /*
     * If no course can be scheduled, there may be a broken
     * prerequisite reference. Add the first remaining course
     * to prevent an infinite loop and preserve visibility.
     */
    if (semesterCourses.length === 0 && unscheduledCourses.length > 0) {
      semesterCourses.push(createPlannedCourse(unscheduledCourses[0]))
    }

    const semesterCourseIds = new Set(
      semesterCourses.map((course) => course.id),
    )

    for (const course of semesterCourses) {
      completedCourseIds.add(course.id)
    }

    for (let index = unscheduledCourses.length - 1; index >= 0; index -= 1) {
      if (semesterCourseIds.has(unscheduledCourses[index].id)) {
        unscheduledCourses.splice(index, 1)
      }
    }

    semesters.push({
      id: randomUUID(),
      label: formatSemesterLabel(currentTerm, currentYear),
      term: currentTerm,
      year: currentYear,
      creditTarget,
      courses: semesterCourses,
    })

    const next = getNextTerm(currentTerm, currentYear, options.includeSummer)

    currentTerm = next.term
    currentYear = next.year
  }

  const totalPlannedCredits = semesters.reduce(
    (semesterTotal, semester) =>
      semesterTotal +
      semester.courses.reduce(
        (courseTotal, course) => courseTotal + course.credits,
        0,
      ),
    0,
  )

  return {
    id: randomUUID(),
    studentId: "local-student",
    programId: program.id,
    educationLevel: program.level,
    semesters,
    completedCredits,
    totalPlannedCredits,
    estimatedGraduation: calculateEstimatedGraduation(semesters),
    generatedAt: new Date().toISOString(),
  }
}
