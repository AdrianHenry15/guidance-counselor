import type {
  PlannedCourse,
  PlannedSemester,
  StudentAcademicPlan,
} from "@/types/academic.type"

interface MovePlannedCourseArguments {
  plan: StudentAcademicPlan
  courseId: string
  sourceSemesterId: string
  targetSemesterId: string
}

/**
 * Removes a course from a semester without mutating the original array.
 */
function removeCourseFromSemester(
  semester: PlannedSemester,
  courseId: string,
): {
  semester: PlannedSemester
  removedCourse?: PlannedCourse
} {
  const removedCourse = semester.courses.find(
    (course) => course.id === courseId,
  )

  if (!removedCourse) {
    return { semester }
  }

  return {
    removedCourse,
    semester: {
      ...semester,
      courses: semester.courses.filter((course) => course.id !== courseId),
    },
  }
}

/**
 * Moves one planned course between existing semesters.
 */
export function movePlannedCourse({
  plan,
  courseId,
  sourceSemesterId,
  targetSemesterId,
}: MovePlannedCourseArguments): StudentAcademicPlan {
  if (sourceSemesterId === targetSemesterId) {
    return plan
  }

  const sourceSemester = plan.semesters.find(
    (semester) => semester.id === sourceSemesterId,
  )

  const targetSemester = plan.semesters.find(
    (semester) => semester.id === targetSemesterId,
  )

  if (!sourceSemester || !targetSemester) {
    throw new Error("The source or target semester could not be found.")
  }

  const removal = removeCourseFromSemester(sourceSemester, courseId)

  if (!removal.removedCourse) {
    throw new Error("The selected course could not be found.")
  }

  const updatedSemesters = plan.semesters.map((semester) => {
    if (semester.id === sourceSemesterId) {
      return removal.semester
    }

    if (semester.id === targetSemesterId) {
      return {
        ...semester,
        courses: [...semester.courses, removal.removedCourse!],
      }
    }

    return semester
  })

  return {
    ...plan,
    semesters: updatedSemesters,
  }
}
