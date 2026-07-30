import type { TranscriptCourse } from "@/types/transcript.type"

export interface TranscriptAnalyzeResponse {
  courses: TranscriptCourse[]
  parserId: string
  detectionScore: number
  usedGenericFallback: boolean
  warnings: string[]
}

export interface TranscriptAnalyzeErrorResponse {
  error: string
  courses?: TranscriptCourse[]
  parserId?: string
  detectionScore?: number
  usedGenericFallback?: boolean
  warnings?: string[]
}
