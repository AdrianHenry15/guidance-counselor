import { describe, expect, it } from "vitest"

import { computerScienceBachelorProgram } from "@/data/degree.data"
import { allocateTranscriptCourses } from "@/lib/planner/allocate-transcript-courses"
import { expandProgramRequirements } from "@/lib/planner/expand-requirements"
import { createTranscriptCourse } from "@/tests/factories/transcript-course.factory"

describe("allocateTranscriptCourses", () => {
  it("applies an exact course match", () => {
    const requiredCourses = expandProgramRequirements(
      computerScienceBachelorProgram,
    )

    const requiredCourse = requiredCourses.find(
      (course) => course.title === "English Composition I",
    )

    expect(requiredCourse).toBeDefined()

    const transcriptCourse = createTranscriptCourse({
      id: "english-composition-transfer",
      title: "English Composition I",
      subjectArea: "english",
      credits: 3,
    })

    const result = allocateTranscriptCourses({
      requiredCourses,
      transcriptCourses: [transcriptCourse],
      requirements: computerScienceBachelorProgram.requirements,
    })

    expect(result.appliedTranscriptCredits).toBe(3)

    expect(result.completedCourseIds.has(requiredCourse!.id)).toBe(true)

    expect(result.transcriptAllocations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          transcriptCourseId: transcriptCourse.id,
          appliedCredits: 3,
          unappliedCredits: 0,
          allocationType: "exact_course",
        }),
      ]),
    )
  })

  it("ignores failed transcript courses", () => {
    const requiredCourses = expandProgramRequirements(
      computerScienceBachelorProgram,
    )

    const transcriptCourse = createTranscriptCourse({
      title: "English Composition I",
      subjectArea: "english",
      completionStatus: "failed",
    })

    const result = allocateTranscriptCourses({
      requiredCourses,
      transcriptCourses: [transcriptCourse],
      requirements: computerScienceBachelorProgram.requirements,
    })

    expect(result.appliedTranscriptCredits).toBe(0)

    expect(result.transcriptAllocations).toHaveLength(0)
  })

  it("ignores excluded transcript courses", () => {
    const requiredCourses = expandProgramRequirements(
      computerScienceBachelorProgram,
    )

    const transcriptCourse = createTranscriptCourse({
      title: "English Composition I",
      subjectArea: "english",
      includedInPlan: false,
    })

    const result = allocateTranscriptCourses({
      requiredCourses,
      transcriptCourses: [transcriptCourse],
      requirements: computerScienceBachelorProgram.requirements,
    })

    expect(result.appliedTranscriptCredits).toBe(0)
  })

  it("applies compatible coursework to a general education requirement", () => {
    const requiredCourses = expandProgramRequirements(
      computerScienceBachelorProgram,
    )

    const transcriptCourse = createTranscriptCourse({
      id: "psychology-transfer",
      title: "Introduction to Psychology",
      subjectArea: "social_science",
      credits: 3,
    })

    const result = allocateTranscriptCourses({
      requiredCourses,
      transcriptCourses: [transcriptCourse],
      requirements: computerScienceBachelorProgram.requirements,
    })

    const allocation = result.transcriptAllocations.find(
      (item) => item.transcriptCourseId === transcriptCourse.id,
    )

    expect(allocation).toBeDefined()
    expect(allocation?.appliedCredits).toBe(3)
    expect(allocation?.unappliedCredits).toBe(0)

    expect(["subject_requirement", "general_education"]).toContain(
      allocation?.allocationType,
    )
  })

  it("records credits that cannot be applied", () => {
    const requiredCourses = expandProgramRequirements(
      computerScienceBachelorProgram,
    )

    /*
     * This oversized course exceeds the available credit capacity
     * only after the program has been fully satisfied.
     */
    const transcriptCourses = requiredCourses.map((course, index) =>
      createTranscriptCourse({
        id: `completed-${index}`,
        title: course.title,
        subjectArea: course.subjectArea,
        credits: course.credits,
      }),
    )

    const extraCourse = createTranscriptCourse({
      id: "extra-course",
      title: "Extra Coursework",
      subjectArea: "general_elective",
      credits: 3,
    })

    const result = allocateTranscriptCourses({
      requiredCourses,
      transcriptCourses: [...transcriptCourses, extraCourse],
      requirements: computerScienceBachelorProgram.requirements,
    })

    const allocation = result.transcriptAllocations.find(
      (item) => item.transcriptCourseId === extraCourse.id,
    )

    expect(allocation).toEqual(
      expect.objectContaining({
        appliedCredits: 0,
        unappliedCredits: 3,
        allocationType: "unapplied",
      }),
    )
  })
})
