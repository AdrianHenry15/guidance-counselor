import { randomUUID } from "crypto"

import type {
  AcademicTerm,
  GeneralizedCourse,
  PlannedCourse,
  PlannedSemester,
} from "@/types/academic.type"
import type { GeneratePlanOptions } from "@/types/planner.type"

import {
  formatSemesterLabel,
  getCreditTarget,
  getNextTerm,
} from "./planner-terms"

interface ScheduleCoursesArguments {
  courses: GeneralizedCourse[]
  completedCourseIds: Set<string>
  options: GeneratePlanOptions
}

function prerequisitesAreSatisfied(
  course: GeneralizedCourse,
  completedCourseIds: Set<string>,
): boolean {
  return (
    !course.prerequisites?.length ||
    course.prerequisites.every((id) => completedCourseIds.has(id))
  )
}

function toPlannedCourse(course: GeneralizedCourse): PlannedCourse {
  return {
    ...course,
    status: "planned",
    source: "degree_requirement",
  }
}

export function scheduleCourses({
  courses,
  completedCourseIds,
  options,
}: ScheduleCoursesArguments): PlannedSemester[] {
  const unscheduled = [...courses]
  const semesters: PlannedSemester[] = []

  let term: AcademicTerm = options.startTerm
  let year = options.startYear

  const maximumSemesters = 30

  for (
    let semesterIndex = 0;
    unscheduled.length > 0 && semesterIndex < maximumSemesters;
    semesterIndex += 1
  ) {
    const creditTarget = getCreditTarget(term, options)

    const semesterCourses: PlannedCourse[] = []

    let semesterCredits = 0

    const available = unscheduled.filter((course) =>
      prerequisitesAreSatisfied(course, completedCourseIds),
    )

    for (const course of available) {
      const exceedsTarget = semesterCredits + course.credits > creditTarget

      if (exceedsTarget && semesterCourses.length > 0) {
        continue
      }

      semesterCourses.push(toPlannedCourse(course))

      semesterCredits += course.credits

      if (semesterCredits >= creditTarget) {
        break
      }
    }

    if (semesterCourses.length === 0) {
      throw new Error(
        "Unable to schedule remaining courses because their prerequisites cannot be satisfied.",
      )
    }

    const scheduledIds = new Set(semesterCourses.map((course) => course.id))

    for (const course of semesterCourses) {
      completedCourseIds.add(course.id)
    }

    for (let index = unscheduled.length - 1; index >= 0; index -= 1) {
      if (scheduledIds.has(unscheduled[index].id)) {
        unscheduled.splice(index, 1)
      }
    }

    semesters.push({
      id: randomUUID(),
      label: formatSemesterLabel(term, year),
      term,
      year,
      creditTarget,
      courses: semesterCourses,
    })

    const next = getNextTerm(term, year, options.includeSummer)

    term = next.term
    year = next.year
  }

  if (unscheduled.length > 0) {
    throw new Error(
      `Unable to schedule ${unscheduled.length} remaining courses.`,
    )
  }

  return semesters
}
