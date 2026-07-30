import type { ExtractedCourseRow } from "./extracted-course-row.type"

/**
 * Contract implemented by generic and institution-specific transcript parsers.
 */
export interface TranscriptParser {
  id: string

  /**
   * Returns a score from 0 to 1 indicating how strongly this parser matches
   * the supplied document.
   */
  detect: (text: string) => number

  /**
   * Extracts course-shaped rows from the supplied transcript text.
   */
  parse: (text: string) => ExtractedCourseRow[]
}
