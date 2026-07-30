import type { ExtractedCourseRow } from "./extracted-course-row.type"
import { genericCourseRowParser } from "./generic-course-row-parser"
import type { TranscriptParser } from "./transcript-parser.type"
import { valenciaTranscriptParser } from "./valencia-transcript-parser"

const institutionParsers: TranscriptParser[] = [valenciaTranscriptParser]

const institutionDetectionThreshold = 0.65

export interface TranscriptParserResult {
  parserId: string
  detectionScore: number
  usedGenericFallback: boolean
  rows: ExtractedCourseRow[]
}

/**
 * Returns the strongest matching institution parser and its detection score.
 */
export function detectTranscriptParser(text: string): {
  parser: TranscriptParser
  score: number
} {
  const strongestMatch = institutionParsers
    .map((parser) => ({
      parser,
      score: parser.detect(text),
    }))
    .sort((left, right) => right.score - left.score)[0]

  if (strongestMatch && strongestMatch.score >= institutionDetectionThreshold) {
    return strongestMatch
  }

  return {
    parser: genericCourseRowParser,
    score: genericCourseRowParser.detect(text),
  }
}

/**
 * Preserves the existing parser-selection API.
 */
export function selectTranscriptParser(text: string): TranscriptParser {
  return detectTranscriptParser(text).parser
}

/**
 * Parses transcript rows while exposing parser diagnostics.
 */
export function parseTranscriptRowsDetailed(
  text: string,
): TranscriptParserResult {
  const detected = detectTranscriptParser(text)
  const detectedRows = detected.parser.parse(text)

  if (
    detectedRows.length > 0 ||
    detected.parser.id === genericCourseRowParser.id
  ) {
    return {
      parserId: detected.parser.id,
      detectionScore: detected.score,
      usedGenericFallback: false,
      rows: detectedRows,
    }
  }

  return {
    parserId: genericCourseRowParser.id,
    detectionScore: detected.score,
    usedGenericFallback: true,
    rows: genericCourseRowParser.parse(text),
  }
}

/**
 * Compatibility wrapper for existing callers.
 */
export function parseTranscriptRows(text: string): ExtractedCourseRow[] {
  return parseTranscriptRowsDetailed(text).rows
}
