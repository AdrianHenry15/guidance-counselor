import { normalizeCourseName } from "@/lib/transcript/normalize-course"
import { parseTranscriptText } from "@/lib/transcript/parse-transcript-text"
import { describe, expect, it } from "vitest"

describe("parseTranscriptText", () => {
  it("ignores transcript metadata and parses only course rows", () => {
    const text = [
      "OFFICIAL TRANSCRIPT",
      "Student Name Adrian Henry",
      "Student ID 123456789",
      "Program Associate in Arts",
      "Fall 2024",
      "English Composition I A 3 credits",
      "Term GPA 3.50",
      "Credits Attempted 12",
      "Credits Earned 12",
      "College Algebra B 3 credits",
      "Academic Standing Good",
      "Page 1",
    ].join("\n")

    const courses = parseTranscriptText(text)

    expect(courses).toHaveLength(2)

    expect(courses.map((course) => course.normalizedTitle)).toEqual([
      "English Composition I",
      "College Algebra",
    ])
  })
  it("ignores lines without both a grade and credits", () => {
    const text = [
      "Student Academic Record",
      "Academic Standing A",
      "Total credits earned 24 credits",
      "English Composition I A 3 credits",
    ].join("\n")

    const courses = parseTranscriptText(text)

    expect(courses).toHaveLength(1)
    expect(courses[0]?.normalizedTitle).toBe("English Composition I")
  })
  it("parses course-code rows with bare decimal credits", () => {
    const courses = parseTranscriptText(
      [
        "MAC 1114 College Trigonometry 3.00 C",
        "XFER 1000 The Discipline of Computing 1.00 B",
      ].join("\n"),
    )

    expect(courses).toHaveLength(2)

    expect(courses[0]).toEqual(
      expect.objectContaining({
        normalizedTitle: "MAC 1114 College Trigonometry",
        credits: 3,
        grade: "C",
        completionStatus: "passed",
      }),
    )

    expect(courses[1]).toEqual(
      expect.objectContaining({
        normalizedTitle: "XFER 1000 The Discipline of Computing",
        credits: 1,
        grade: "B",
        completionStatus: "passed",
      }),
    )
  })

  it("normalizes a recognized course while preserving its original code", () => {
    const courses = parseTranscriptText("ENC 1101 Freshman Comp I 3.00 B")

    expect(courses[0]).toEqual(
      expect.objectContaining({
        originalName: "ENC 1101 Freshman Comp I",
        normalizedTitle: "English Composition I",
        credits: 3,
        grade: "B",
      }),
    )
  })

  it("rejects transcript certificate and grading notes", () => {
    const courses = parseTranscriptText(
      [
        "Advanced Technical Certificate & Applied Technology Diploma: Certificate awarded to Associate in Science degree students seeking A",
        "average. S+ grades are equivalent to a grade of C or better and counts as credits earned in B",
      ].join("\n"),
    )

    expect(courses).toEqual([])
  })
  it("normalizes Freshman Comp I to English Composition I", () => {
    expect(normalizeCourseName("Freshman Comp I")).toEqual({
      normalizedTitle: "English Composition I",
      subjectArea: "english",
    })
  })
  it.each([
    "College Trigonometry",
    "Trigonometry",
    "Precalculus and Trigonometry",
  ])("classifies %s as mathematics", (courseName) => {
    expect(normalizeCourseName(courseName)).toEqual({
      normalizedTitle: courseName,
      subjectArea: "mathematics",
    })
  })

  it.each(["Intro Italian I", "Elementary Italian I", "Italian II"])(
    "classifies %s as foreign language",
    (courseName) => {
      expect(normalizeCourseName(courseName)).toEqual({
        normalizedTitle: courseName,
        subjectArea: "foreign_language",
      })
    },
  )

  it("normalizes Freshman Comp I", () => {
    expect(normalizeCourseName("Freshman Comp I")).toEqual({
      normalizedTitle: "English Composition I",
      subjectArea: "english",
    })
  })
  it("parses institutional courses with trailing quality points", () => {
    const courses = parseTranscriptText(
      [
        "ENC 1102 Freshman Comp II 3.00 A 12.00",
        "SLS 1122 New Student Experience 3.00 A 12.00",
      ].join("\n"),
    )

    expect(courses).toHaveLength(2)

    expect(courses[0]).toEqual(
      expect.objectContaining({
        originalName: "ENC 1102 Freshman Comp II",
        normalizedTitle: "English Composition II",
        subjectArea: "english",
        credits: 3,
        grade: "A",
        completionStatus: "passed",
      }),
    )

    expect(courses[1]).toEqual(
      expect.objectContaining({
        originalName: "SLS 1122 New Student Experience",
        normalizedTitle: "College Success",
        subjectArea: "college_success",
        credits: 3,
        grade: "A",
        completionStatus: "passed",
      }),
    )
  })
  it("ignores a zero-credit no-credit transfer entry", () => {
    const courses = parseTranscriptText(
      "XFER 1000 Atmospheric Proc & Patterns 0.00 N",
    )

    expect(courses).toEqual([])
  })
  it("normalizes Freshman Comp II", () => {
    expect(normalizeCourseName("Freshman Comp II")).toEqual({
      normalizedTitle: "English Composition II",
      subjectArea: "english",
    })
  })

  it("normalizes New Student Experience", () => {
    expect(normalizeCourseName("New Student Experience")).toEqual({
      normalizedTitle: "College Success",
      subjectArea: "college_success",
    })
  })
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
