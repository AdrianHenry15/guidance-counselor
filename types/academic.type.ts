export type EducationLevel =
  | "elementary"
  | "middle-school"
  | "high-school"
  | "college"

export type AcademicTerm = "fall" | "spring" | "summer"

export type CourseStatus =
  | "completed"
  | "in-progress"
  | "planned"
  | "recommended"

export type SubjectArea =
  | "english"
  | "mathematics"
  | "science"
  | "social_science"
  | "humanities"
  | "computer_science"
  | "foreign_language"
  | "fine_arts"
  | "health"
  | "physical_education"
  | "major_core"
  | "major_elective"
  | "general_elective"
  | "college_success"

export interface GeneralizedCourse {
  id: string
  title: string
  description: string
  subjectArea: SubjectArea
  credits: number
  level: EducationLevel
  difficulty?: "introductory" | "intermediate" | "advanced"
  prerequisites?: string[]
  tags?: string[]
}

export interface PlannedCourse extends GeneralizedCourse {
  status: CourseStatus
  source?: "transcript" | "degree_requirement" | "user_added"
}

export interface PlannedSemester {
  id: string
  label: string
  term: AcademicTerm
  year: number
  creditTarget: number
  courses: PlannedCourse[]
}

export interface StudentAcademicPlan {
  id: string
  studentId: string
  programId: string
  educationLevel: EducationLevel
  semesters: PlannedSemester[]
  completedCredits: number
  totalPlannedCredits: number
  estimatedGraduation?: string
  generatedAt: string
}
