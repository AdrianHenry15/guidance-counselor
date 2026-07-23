import type {
  EducationLevel,
  GeneralizedCourse,
  SubjectArea,
} from "./academic.type"

export type RequirementType =
  | "specific_course"
  | "subject_credits"
  | "elective_credits"
  | "total_credits"

export interface DegreeRequirement {
  id: string
  title: string
  description: string
  type: RequirementType
  requiredCredits: number
  subjectArea?: SubjectArea
  courseOptions?: GeneralizedCourse[]
  minimumCourses?: number
}

export interface AcademicProgram {
  id: string
  name: string
  level: EducationLevel
  credential:
    | "high_school_diploma"
    | "certificate"
    | "associate"
    | "bachelor"
    | "minor"
  totalCredits: number
  requirements: DegreeRequirement[]
}
