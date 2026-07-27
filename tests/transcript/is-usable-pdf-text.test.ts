import { describe, expect, it } from "vitest"

import { isUsablePdfText } from "@/lib/transcript/is-usable-pdf-text"

describe("isUsablePdfText", () => {
  it("rejects empty text", () => {
    expect(isUsablePdfText("")).toBe(false)
  })

  it("rejects whitespace-only text", () => {
    expect(isUsablePdfText(" \n\t   \r\n ")).toBe(false)
  })

  it("rejects text shorter than 100 normalized characters", () => {
    const text = "a".repeat(99)

    expect(isUsablePdfText(text)).toBe(false)
  })

  it("rejects 20 words when normalized text is still shorter than 100 characters", () => {
    /**
     * Twenty four-letter words plus nineteen spaces equals 99 characters.
     */
    const text = Array.from({ length: 20 }, () => "word").join(" ")

    expect(text).toHaveLength(99)
    expect(isUsablePdfText(text)).toBe(false)
  })

  it("rejects text with fewer than 20 words even when it exceeds 100 characters", () => {
    const text = Array.from({ length: 19 }, () => "transcript").join(" ")

    expect(text.length).toBeGreaterThanOrEqual(100)
    expect(isUsablePdfText(text)).toBe(false)
  })

  it("accepts text with at least 20 words and 100 characters", () => {
    const text = Array.from(
      { length: 20 },
      (_, index) => `courseword${index + 1}`,
    ).join(" ")

    expect(text.length).toBeGreaterThanOrEqual(100)
    expect(isUsablePdfText(text)).toBe(true)
  })

  it("normalizes repeated spaces, tabs, and line breaks before checking usability", () => {
    const words = Array.from(
      { length: 20 },
      (_, index) => `transcriptcourse${index + 1}`,
    )

    const text = words.join(" \n\t  ")

    expect(isUsablePdfText(text)).toBe(true)
  })

  it("accepts realistic transcript text", () => {
    const text = [
      "Student Academic Transcript",
      "Institution Valencia College",
      "English Composition I A 3 credits",
      "College Algebra B 3 credits",
      "Introduction to Psychology A 3 credits",
      "General Biology B 4 credits",
      "Introduction to Programming A 3 credits",
      "Academic standing good",
    ].join("\n")

    expect(text.replace(/\s+/g, " ").trim().length).toBeGreaterThanOrEqual(100)

    expect(
      text.replace(/\s+/g, " ").trim().split(" ").length,
    ).toBeGreaterThanOrEqual(20)

    expect(isUsablePdfText(text)).toBe(true)
  })

  it("rejects a short scanned-document placeholder", () => {
    const text =
      "Scanned document image with no selectable transcript course information."

    expect(isUsablePdfText(text)).toBe(false)
  })
})
