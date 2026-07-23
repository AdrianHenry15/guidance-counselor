import type { EducationLevel, SubjectArea } from "./academic.type"

export interface TranscriptCourse {
  id: string
  originalName: string
  normalizedTitle?: string
  subjectArea?: SubjectArea
  credits: number
  grade?: string
  completed: boolean
  institution?: string
  term?: string
  year?: number
}

export interface TranscriptAnalysis {
  id: string
  studentName?: string
  educationLevel: EducationLevel
  institution?: string
  estimatedCreditsEarned: number
  courses: TranscriptCourse[]
  warnings: string[]
  analyzedAt: string
}
