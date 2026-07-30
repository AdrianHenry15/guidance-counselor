/**
 * Internal representation of one course row extracted from transcript text.
 *
 * This is intentionally separate from TranscriptCourse. Extraction determines
 * what the document says; normalization and classification happen afterward.
 */
export interface ExtractedCourseRow {
  parserId: string
  rawLine: string
  courseCode?: string
  title: string
  credits?: number
  grade?: string
  confidence: number
}
