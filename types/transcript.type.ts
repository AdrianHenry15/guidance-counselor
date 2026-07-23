import type { EducationLevel, SubjectArea } from "@/types/academic.type"

export type TranscriptFileType = "pdf" | "image" | "text" | "csv"

export interface TranscriptCourse {
  id: string
  originalName: string
  normalizedTitle: string
  subjectArea: SubjectArea
  credits: number
  grade?: string
  completed: boolean
  institution?: string
  term?: string
  year?: number
  confidence: number
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
