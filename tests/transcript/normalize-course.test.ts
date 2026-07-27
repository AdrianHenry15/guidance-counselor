import { describe, expect, it } from "vitest"

import { normalizeCourseName } from "@/lib/transcript/normalize-course"

describe("normalizeCourseName", () => {
  describe("English courses", () => {
    it.each([
      "English Composition I",
      "Composition 1",
      "Freshman Composition I",
      "ENC 1101",
      "ENC1101",
    ])("normalizes %s to English Composition I", (courseName) => {
      expect(normalizeCourseName(courseName)).toEqual({
        normalizedTitle: "English Composition I",
        subjectArea: "english",
      })
    })

    it.each([
      "English Composition II",
      "Composition 2",
      "Freshman Composition II",
      "ENC 1102",
      "ENC1102",
    ])("normalizes %s to English Composition II", (courseName) => {
      expect(normalizeCourseName(courseName)).toEqual({
        normalizedTitle: "English Composition II",
        subjectArea: "english",
      })
    })

    it("does not confuse English Composition II with English Composition I", () => {
      expect(normalizeCourseName("English Composition II")).toEqual({
        normalizedTitle: "English Composition II",
        subjectArea: "english",
      })
    })
  })

  describe("Mathematics courses", () => {
    it.each(["College Algebra", "MAC 1105", "MAC1105"])(
      "normalizes %s to College Algebra",
      (courseName) => {
        expect(normalizeCourseName(courseName)).toEqual({
          normalizedTitle: "College Algebra",
          subjectArea: "mathematics",
        })
      },
    )

    it.each(["Calculus I", "Calculus 1", "MAC 2311", "MAC2311"])(
      "normalizes %s to Calculus I",
      (courseName) => {
        expect(normalizeCourseName(courseName)).toEqual({
          normalizedTitle: "Calculus I",
          subjectArea: "mathematics",
        })
      },
    )

    it.each(["Calculus II", "Calculus 2", "MAC 2312", "MAC2312"])(
      "normalizes %s to Calculus II",
      (courseName) => {
        expect(normalizeCourseName(courseName)).toEqual({
          normalizedTitle: "Calculus II",
          subjectArea: "mathematics",
        })
      },
    )

    it("does not confuse Calculus II with Calculus I", () => {
      expect(normalizeCourseName("Calculus II")).toEqual({
        normalizedTitle: "Calculus II",
        subjectArea: "mathematics",
      })
    })
  })

  describe("Computer science courses", () => {
    it.each([
      "Introduction to Programming",
      "Intro to Programming",
      "Programming Fundamentals",
      "COP 1000",
      "COP1000",
      "COP 2220",
      "COP2220",
    ])("normalizes %s to Introductory Programming", (courseName) => {
      expect(normalizeCourseName(courseName)).toEqual({
        normalizedTitle: "Introductory Programming",
        subjectArea: "computer_science",
      })
    })

    it.each([
      "Object Oriented Programming",
      "Object-Oriented Programming",
      "COP 3330",
      "COP3330",
    ])("normalizes %s to Object-Oriented Programming", (courseName) => {
      expect(normalizeCourseName(courseName)).toEqual({
        normalizedTitle: "Object-Oriented Programming",
        subjectArea: "computer_science",
      })
    })

    it.each([
      "Data Structures",
      "Data Structures and Algorithms",
      "COP 3530",
      "COP3530",
    ])("normalizes %s to Data Structures and Algorithms", (courseName) => {
      expect(normalizeCourseName(courseName)).toEqual({
        normalizedTitle: "Data Structures and Algorithms",
        subjectArea: "computer_science",
      })
    })
  })

  describe("Generalized subject requirements", () => {
    it.each([
      "General Biology",
      "Introduction to Biology",
      "BIO 101",
      "BIO2010",
    ])("normalizes %s to Laboratory Science", (courseName) => {
      expect(normalizeCourseName(courseName)).toEqual({
        normalizedTitle: "Laboratory Science",
        subjectArea: "science",
      })
    })

    it.each([
      "Introduction to Psychology",
      "Principles of Sociology",
      "Microeconomics",
      "American Political Science",
    ])("normalizes %s to Social Science Elective", (courseName) => {
      expect(normalizeCourseName(courseName)).toEqual({
        normalizedTitle: "Social Science Elective",
        subjectArea: "social_science",
      })
    })

    it.each([
      "Introduction to Humanities",
      "Introduction to Philosophy",
      "American Literature",
      "Art Appreciation",
    ])("normalizes %s to Humanities Elective", (courseName) => {
      expect(normalizeCourseName(courseName)).toEqual({
        normalizedTitle: "Humanities Elective",
        subjectArea: "humanities",
      })
    })
  })

  describe("Matching behavior", () => {
    it("matches course names without regard to capitalization", () => {
      expect(normalizeCourseName("college algebra")).toEqual({
        normalizedTitle: "College Algebra",
        subjectArea: "mathematics",
      })

      expect(normalizeCourseName("OBJECT-ORIENTED PROGRAMMING")).toEqual({
        normalizedTitle: "Object-Oriented Programming",
        subjectArea: "computer_science",
      })
    })

    it("matches recognized text inside a longer transcript title", () => {
      expect(
        normalizeCourseName("MAC 2311 Calculus I With Analytic Geometry"),
      ).toEqual({
        normalizedTitle: "Calculus I",
        subjectArea: "mathematics",
      })
    })
  })

  describe("Unknown courses", () => {
    it("preserves an unknown course title", () => {
      expect(normalizeCourseName("Introduction to Astronomy")).toEqual({
        normalizedTitle: "Introduction to Astronomy",
        subjectArea: "general_elective",
      })
    })

    it("trims surrounding whitespace from an unknown course", () => {
      expect(normalizeCourseName("   Digital Media Production   ")).toEqual({
        normalizedTitle: "Digital Media Production",
        subjectArea: "general_elective",
      })
    })

    it("defaults an empty course name to a general elective", () => {
      expect(normalizeCourseName("   ")).toEqual({
        normalizedTitle: "",
        subjectArea: "general_elective",
      })
    })
  })
})
