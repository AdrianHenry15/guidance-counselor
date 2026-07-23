import type { GeneralizedCourse, PlannedSemester } from "@/types/academic.type"
import type {
  PlanValidationIssue,
  PlanValidationResult,
} from "@/types/plan-validation.type"

interface ValidatePlanArguments {
  semesters: PlannedSemester[]
  initiallyCompletedCourseIds: Set<string>
  appliedCredits: number
  totalPlannedCredits: number
  programTotalCredits: number
}

function createIssueId(
  type: PlanValidationIssue["type"],
  courseId?: string,
  semesterId?: string,
): string {
  return [type, courseId ?? "plan", semesterId ?? "global"].join(":")
}

function calculateSemesterCredits(semester: PlannedSemester): number {
  return semester.courses.reduce((total, course) => total + course.credits, 0)
}

function validateCreditMismatch({
  appliedCredits,
  totalPlannedCredits,
  programTotalCredits,
}: Pick<
  ValidatePlanArguments,
  "appliedCredits" | "totalPlannedCredits" | "programTotalCredits"
>): PlanValidationIssue[] {
  const mappedCredits = appliedCredits + totalPlannedCredits

  if (mappedCredits === programTotalCredits) {
    return []
  }

  return [
    {
      id: createIssueId("credit_mismatch"),
      type: "credit_mismatch",
      severity: "error",
      message:
        `The plan maps ${mappedCredits} of ` +
        `${programTotalCredits} required credits.`,
    },
  ]
}

function validateSemesterCreditLoads(
  semesters: PlannedSemester[],
): PlanValidationIssue[] {
  return semesters.flatMap((semester) => {
    const semesterCredits = calculateSemesterCredits(semester)

    if (semesterCredits <= semester.creditTarget) {
      return []
    }

    return [
      {
        id: createIssueId("credit_overload", undefined, semester.id),
        type: "credit_overload",
        severity: "warning",
        semesterId: semester.id,
        message:
          `${semester.label} contains ` +
          `${semesterCredits} credits, above the ` +
          `${semester.creditTarget}-credit target.`,
      },
    ]
  })
}

function validateDuplicateCourses(
  semesters: PlannedSemester[],
): PlanValidationIssue[] {
  const firstOccurrenceByCourseId = new Map<string, PlannedSemester>()

  const issues: PlanValidationIssue[] = []

  for (const semester of semesters) {
    for (const course of semester.courses) {
      const firstSemester = firstOccurrenceByCourseId.get(course.id)

      if (!firstSemester) {
        firstOccurrenceByCourseId.set(course.id, semester)
        continue
      }

      issues.push({
        id: createIssueId("duplicate_course", course.id, semester.id),
        type: "duplicate_course",
        severity: "error",
        semesterId: semester.id,
        courseId: course.id,
        message:
          `${course.title} appears in both ` +
          `${firstSemester.label} and ${semester.label}.`,
      })
    }
  }

  return issues
}

function validatePrerequisiteOrder(
  semesters: PlannedSemester[],
  initiallyCompletedCourseIds: Set<string>,
): PlanValidationIssue[] {
  const completedBeforeSemester = new Set(initiallyCompletedCourseIds)

  const issues: PlanValidationIssue[] = []

  for (const semester of semesters) {
    for (const course of semester.courses) {
      const missingPrerequisites = getMissingPrerequisites(
        course,
        completedBeforeSemester,
      )

      if (!missingPrerequisites.length) {
        continue
      }

      issues.push({
        id: createIssueId("missing_prerequisite", course.id, semester.id),
        type: "missing_prerequisite",
        severity: "error",
        semesterId: semester.id,
        courseId: course.id,
        message:
          `${course.title} is scheduled in ` +
          `${semester.label} before prerequisite` +
          `${missingPrerequisites.length === 1 ? "" : "s"} ` +
          `${missingPrerequisites.join(", ")}.`,
      })
    }

    for (const course of semester.courses) {
      completedBeforeSemester.add(course.id)
    }
  }

  return issues
}

function getMissingPrerequisites(
  course: GeneralizedCourse,
  completedCourseIds: Set<string>,
): string[] {
  return (
    course.prerequisites?.filter(
      (prerequisiteId) => !completedCourseIds.has(prerequisiteId),
    ) ?? []
  )
}

export function validatePlan({
  semesters,
  initiallyCompletedCourseIds,
  appliedCredits,
  totalPlannedCredits,
  programTotalCredits,
}: ValidatePlanArguments): PlanValidationResult {
  const issues = [
    ...validateCreditMismatch({
      appliedCredits,
      totalPlannedCredits,
      programTotalCredits,
    }),
    ...validateSemesterCreditLoads(semesters),
    ...validateDuplicateCourses(semesters),
    ...validatePrerequisiteOrder(semesters, initiallyCompletedCourseIds),
  ]

  const errorCount = issues.filter((issue) => issue.severity === "error").length

  const warningCount = issues.filter(
    (issue) => issue.severity === "warning",
  ).length

  return {
    isValid: errorCount === 0,
    issues,
    errorCount,
    warningCount,
  }
}
