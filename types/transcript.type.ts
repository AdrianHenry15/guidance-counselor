import type { EducationLevel, SubjectArea } from "@/types/academic.type"

export type TranscriptCourseSource = "extracted" | "manual"

export type TranscriptLineType =
  | "course"
  | "term_header"
  | "summary"
  | "student_info"
  | "unknown"

export type TranscriptFileType = "pdf" | "image" | "text" | "csv"

export type TranscriptCompletionStatus =
  | "passed"
  | "failed"
  | "withdrawn"
  | "in_progress"
  | "unknown"

export interface TranscriptCourse {
  id: string
  originalName: string
  normalizedTitle: string
  subjectArea: SubjectArea
  credits: number
  grade?: string
  completionStatus: TranscriptCompletionStatus
  includedInPlan: boolean
  institution?: string
  term?: string
  year?: string
  confidence: number
  source?: TranscriptCourseSource
}

export interface TranscriptAnalysis {
  id: string
  fileName: string
  fileType: TranscriptFileType
  studentName?: string
  institution?: string
  educationLevel: EducationLevel
  estimatedCreditsEarned: number
  courses: TranscriptCourse[]
  warnings: string[]
  analyzedAt: string
}

export interface AnalyzeTranscriptResponse {
  success: boolean
  analysis?: TranscriptAnalysis
  error?: string
}
