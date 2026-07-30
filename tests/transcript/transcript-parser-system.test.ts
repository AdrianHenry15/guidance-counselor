import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

import { describe, expect, it } from "vitest"

import { selectTranscriptParser } from "@/lib/transcript/parsers/parser-registry"
import {
  parseTranscriptText,
  parseTranscriptTextDetailed,
} from "@/lib/transcript/parse-transcript-text"

const valenciaFixturePath = fileURLToPath(
  new URL(
    "../fixtures/transcripts/valencia-selectable-text.txt",
    import.meta.url,
  ),
)

const valenciaFixture = readFileSync(valenciaFixturePath, "utf8")

describe("transcript parser system", () => {
  it("selects the Valencia profile for a Valencia transcript", () => {
    expect(selectTranscriptParser(valenciaFixture).id).toBe("valencia-college")
  })
  it("reports the selected institution parser", () => {
    const result = parseTranscriptTextDetailed(valenciaFixture)

    expect(result.parserId).toBe("valencia-college")

    expect(result.usedGenericFallback).toBe(false)

    expect(result.courses).toHaveLength(7)
  })

  it("warns when an unknown institution uses generic parsing", () => {
    const result = parseTranscriptTextDetailed(
      [
        "Example State University",
        "CS 101 Introduction to Programming 4.00 A",
      ].join("\n"),
    )

    expect(result.parserId).toBe("generic-course-row")

    expect(result.warnings).toContain(
      "This transcript used the generic course parser. Review course titles, credits, grades, and subject categories before generating a plan.",
    )
  })

  it("extracts the seven credited Valencia courses", () => {
    const courses = parseTranscriptText(valenciaFixture)

    expect(courses).toHaveLength(7)

    expect(courses.reduce((total, course) => total + course.credits, 0)).toBe(
      21,
    )
  })

  it("excludes the explicit zero-credit no-credit duplicate", () => {
    const courses = parseTranscriptText(valenciaFixture)

    expect(
      courses.some((course) => course.credits === 0 && course.grade === "N"),
    ).toBe(false)
  })

  it("normalizes known composition and college-success courses", () => {
    const courses = parseTranscriptText(valenciaFixture)

    expect(
      courses.some(
        (course) => course.normalizedTitle === "English Composition I",
      ),
    ).toBe(true)

    expect(
      courses.some(
        (course) => course.normalizedTitle === "English Composition II",
      ),
    ).toBe(true)

    expect(
      courses.some((course) => course.normalizedTitle === "College Success"),
    ).toBe(true)
  })

  it("classifies mathematics and foreign-language courses", () => {
    const courses = parseTranscriptText(valenciaFixture)

    const trigonometry = courses.find((course) =>
      course.originalName.includes("College Trigonometry"),
    )

    const italian = courses.find((course) =>
      course.originalName.includes("Intro Italian I"),
    )

    expect(trigonometry?.subjectArea).toBe("mathematics")

    expect(italian?.subjectArea).toBe("foreign_language")
  })

  it("ignores transcript totals and legend prose", () => {
    const courses = parseTranscriptText(valenciaFixture)

    expect(
      courses.some((course) =>
        /transcript|grading scale|degree granted|satisfactory grades/i.test(
          course.originalName,
        ),
      ),
    ).toBe(false)
  })

  it("uses the generic parser for an unknown institution", () => {
    const text = [
      "Example State University",
      "CS 101 Introduction to Programming 4.00 A",
      "MATH 120 College Algebra 3.00 B",
    ].join("\n")

    expect(selectTranscriptParser(text).id).toBe("generic-course-row")

    const courses = parseTranscriptText(text)

    expect(courses).toHaveLength(2)

    expect(courses[0]).toEqual(
      expect.objectContaining({
        credits: 4,
        grade: "A",
        subjectArea: "computer_science",
      }),
    )

    expect(courses[1]).toEqual(
      expect.objectContaining({
        credits: 3,
        grade: "B",
        subjectArea: "mathematics",
      }),
    )
  })

  it("supports grade-before-credit CSV rows", () => {
    const courses = parseTranscriptText("English Composition I,A,3 credits")

    expect(courses).toHaveLength(1)

    expect(courses[0]).toEqual(
      expect.objectContaining({
        normalizedTitle: "English Composition I",
        credits: 3,
        grade: "A",
      }),
    )
  })

  it("preserves incomplete rows for manual review", () => {
    const courses = parseTranscriptText(
      ["Calculus I 3 credits", "College Algebra A"].join("\n"),
    )

    expect(courses).toHaveLength(2)

    expect(courses[0]).toEqual(
      expect.objectContaining({
        credits: 3,
        grade: undefined,
        completionStatus: "unknown",
      }),
    )

    expect(courses[1]).toEqual(
      expect.objectContaining({
        credits: 0,
        grade: "A",
        completionStatus: "passed",
      }),
    )
  })
})
