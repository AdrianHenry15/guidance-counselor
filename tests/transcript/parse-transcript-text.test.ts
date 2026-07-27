import { parseTranscriptText } from "@/lib/transcript/parse-transcript-text"
import { describe, expect, it } from "vitest"

describe("parseTranscriptText", () => {
  it("parses a passed course with credits", () => {
    const courses = parseTranscriptText("English Composition I A 3 credits")

    expect(courses).toHaveLength(1)

    expect(courses[0]).toEqual(
      expect.objectContaining({
        originalName: "English Composition I",
        credits: 3,
        grade: "A",
        completionStatus: "passed",
        includedInPlan: true,
        source: "extracted",
      }),
    )
  })

  it.each([
    ["A", "passed", true],
    ["A+", "passed", true],
    ["A-", "passed", true],
    ["B+", "passed", true],
    ["B-", "passed", true],
    ["C+", "passed", true],
    ["D-", "passed", true],
    ["P", "passed", true],
    ["S", "passed", true],
    ["F", "failed", false],
    ["U", "failed", false],
    ["W", "withdrawn", false],
    ["IP", "in_progress", false],
  ] as const)(
    "maps grade %s to %s",
    (grade, completionStatus, includedInPlan) => {
      const courses = parseTranscriptText(`Test Course ${grade} 3 credits`)

      expect(courses).toHaveLength(1)

      expect(courses[0]).toEqual(
        expect.objectContaining({
          originalName: "Test Course",
          grade,
          credits: 3,
          completionStatus,
          includedInPlan,
        }),
      )
    },
  )

  it("normalizes lowercase grades to uppercase", () => {
    const courses = parseTranscriptText("World History b 3 hrs")

    expect(courses[0]).toEqual(
      expect.objectContaining({
        originalName: "World History",
        grade: "B",
        credits: 3,
        completionStatus: "passed",
        includedInPlan: true,
      }),
    )
  })

  it("does not interpret a course-level suffix as a grade", () => {
    const courses = parseTranscriptText("English Composition I 3 credits")

    expect(courses[0]).toEqual(
      expect.objectContaining({
        originalName: "English Composition I",
        grade: undefined,
        credits: 3,
        completionStatus: "unknown",
        includedInPlan: false,
      }),
    )
  })

  it("uses unknown status when a grade is missing", () => {
    const courses = parseTranscriptText("Introduction to Programming 4 credits")

    expect(courses[0]).toEqual(
      expect.objectContaining({
        originalName: "Introduction to Programming",
        grade: undefined,
        credits: 4,
        completionStatus: "unknown",
        includedInPlan: false,
      }),
    )
  })

  it("uses zero credits when a credit value is missing", () => {
    const courses = parseTranscriptText("World History A")

    expect(courses[0]).toEqual(
      expect.objectContaining({
        originalName: "World History",
        grade: "A",
        credits: 0,
        completionStatus: "passed",
        includedInPlan: true,
      }),
    )
  })

  it("parses fractional credits", () => {
    const courses = parseTranscriptText("College Seminar A 1.5 hours")

    expect(courses[0]).toEqual(
      expect.objectContaining({
        originalName: "College Seminar",
        grade: "A",
        credits: 1.5,
      }),
    )
  })

  it("parses multi-digit credits", () => {
    const courses = parseTranscriptText("Clinical Practicum P 12 credits")

    expect(courses[0]).toEqual(
      expect.objectContaining({
        originalName: "Clinical Practicum",
        grade: "P",
        credits: 12,
        completionStatus: "passed",
      }),
    )
  })

  it("supports credit abbreviations", () => {
    const inputs = [
      "Course One A 3 credits",
      "Course Two A 4 hrs",
      "Course Three A 2 hours",
    ]

    const courses = parseTranscriptText(inputs.join("\n"))

    expect(courses.map((course) => course.credits)).toEqual([3, 4, 2])
  })

  it("parses multiple courses separated by new lines", () => {
    const courses = parseTranscriptText(
      [
        "English Composition I A 3 credits",
        "College Algebra B 3 credits",
        "Biology I W 4 credits",
      ].join("\n"),
    )

    expect(courses).toHaveLength(3)

    expect(
      courses.map((course) => ({
        originalName: course.originalName,
        status: course.completionStatus,
      })),
    ).toEqual([
      {
        originalName: "English Composition I",
        status: "passed",
      },
      {
        originalName: "College Algebra",
        status: "passed",
      },
      {
        originalName: "Biology I",
        status: "withdrawn",
      },
    ])
  })

  it("supports Windows-style line endings", () => {
    const courses = parseTranscriptText(
      ["Course One A 3 credits", "Course Two B 4 credits"].join("\r\n"),
    )

    expect(courses).toHaveLength(2)
  })

  it("ignores blank and very short lines", () => {
    const courses = parseTranscriptText(
      ["", " ", "A", "IP", "Course One A 3 credits"].join("\n"),
    )

    expect(courses).toHaveLength(1)
    expect(courses[0].originalName).toBe("Course One")
  })

  it("ignores rows that contain only grade and credit data", () => {
    const courses = parseTranscriptText("A 3 credits")

    expect(courses).toEqual([])
  })

  it("creates a non-empty unique ID for each parsed course", () => {
    const courses = parseTranscriptText(
      ["Course One A 3 credits", "Course Two B 3 credits"].join("\n"),
    )

    expect(courses[0].id).toEqual(expect.any(String))

    expect(courses[1].id).toEqual(expect.any(String))

    expect(courses[0].id).not.toBe(courses[1].id)
  })
})
