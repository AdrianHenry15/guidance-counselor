import type { GeneralizedCourse, PlannedSemester } from "@/types/academic.type"
import type {
  PlanValidationIssue,
  PlanValidationResult,
} from "@/types/plan-validation.type"

/**
 * Inputs required to validate a generated academic plan.
 */
interface ValidatePlanArguments {
  semesters: PlannedSemester[]
  initiallyCompletedCourseIds: Set<string>
  appliedCredits: number
  totalPlannedCredits: number
  programTotalCredits: number
}

/**
 * Creates a stable identifier for a validation issue.
 */
function createIssueId(
  type: PlanValidationIssue["type"],
  courseId?: string,
  semesterId?: string,
): string {
  return [type, courseId ?? "plan", semesterId ?? "global"].join(":")
}

/**
 * Totals the credits scheduled in one semester.
 */
function calculateSemesterCredits(semester: PlannedSemester): number {
  return semester.courses.reduce((total, course) => total + course.credits, 0)
}

/**
 * Checks whether mapped credits equal the program requirement.
 */
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

/**
 * Reports semesters that exceed their credit target.
 */
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

/**
 * Reports courses scheduled more than once.
 */
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

/**
 * Reports courses scheduled before their prerequisites.
 */
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

    /**
     * Courses count as completed only after the semester ends.
     */
    for (const course of semester.courses) {
      completedBeforeSemester.add(course.id)
    }
  }

  return issues
}

/**
 * Returns prerequisite IDs not completed before the course's semester.
 */
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

/**
 * Runs all deterministic validation checks for a generated plan.
 */
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
