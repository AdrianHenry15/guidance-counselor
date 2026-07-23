import type { GeneralizedCourse, SubjectArea } from "@/types/academic.type"
import type { AcademicProgram, DegreeRequirement } from "@/types/degree.type"

const standardCourseCredits = 3

const generalEducationSubjects = [
  "humanities",
  "social_science",
  "foreign_language",
  "fine_arts",
] satisfies SubjectArea[]

function toRomanNumeral(value: number): string {
  const numerals: Array<[number, string]> = [
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ]

  let remaining = value
  let result = ""

  for (const [amount, numeral] of numerals) {
    while (remaining >= amount) {
      result += numeral
      remaining -= amount
    }
  }

  return result
}

function createCreditDistribution(
  requiredCredits: number,
  minimumCourses?: number,
): number[] {
  if (requiredCredits <= 0) {
    return []
  }

  if (minimumCourses && minimumCourses > 0) {
    const baseCredits = Math.floor(requiredCredits / minimumCourses)

    const remainingCredits = requiredCredits % minimumCourses

    return Array.from(
      { length: minimumCourses },
      (_, index) => baseCredits + (index < remainingCredits ? 1 : 0),
    )
  }

  const fullCourseCount = Math.floor(requiredCredits / standardCourseCredits)

  const remainder = requiredCredits % standardCourseCredits

  if (fullCourseCount === 0) {
    return [requiredCredits]
  }

  const distribution = Array.from(
    { length: fullCourseCount },
    () => standardCourseCredits,
  )

  if (remainder > 0) {
    distribution[distribution.length - 1] += remainder
  }

  return distribution
}

function getPlaceholderSubjectArea(
  requirement: DegreeRequirement,
  index: number,
): SubjectArea {
  if (requirement.subjectArea) {
    return requirement.subjectArea
  }

  if (requirement.id === "general-education") {
    return generalEducationSubjects[index % generalEducationSubjects.length]
  }

  return "general_elective"
}

function getPlaceholderTitle(
  requirement: DegreeRequirement,
  index: number,
): string {
  const numeral = toRomanNumeral(index + 1)

  if (requirement.id === "science-sequence") {
    return `Laboratory Science ${numeral}`
  }

  if (requirement.id === "major-electives") {
    return `Computer Science Elective ${numeral}`
  }

  if (requirement.id === "general-electives") {
    return `General Elective ${numeral}`
  }

  if (requirement.id === "general-education") {
    const subjectArea =
      generalEducationSubjects[index % generalEducationSubjects.length]

    const titles: Record<(typeof generalEducationSubjects)[number], string> = {
      humanities: "Humanities",
      social_science: "Social Science",
      foreign_language: "Foreign Language",
      fine_arts: "Fine Arts",
    }

    return `${titles[subjectArea]} Elective ${numeral}`
  }

  return `${requirement.title} ${numeral}`
}

function expandCreditRequirement(
  requirement: DegreeRequirement,
  program: AcademicProgram,
): GeneralizedCourse[] {
  const creditDistribution = createCreditDistribution(
    requirement.requiredCredits,
    requirement.minimumCourses,
  )

  return creditDistribution.map(
    (credits, index): GeneralizedCourse => ({
      id: `${requirement.id}-${index + 1}`,
      title: getPlaceholderTitle(requirement, index),
      description: requirement.description,
      subjectArea: getPlaceholderSubjectArea(requirement, index),
      credits,
      level: program.level,
      difficulty:
        requirement.id === "major-electives" ? "advanced" : "introductory",
      prerequisites: [],
      tags: ["generated-requirement", requirement.id, requirement.type],
    }),
  )
}

export function expandRequirement(
  requirement: DegreeRequirement,
  program: AcademicProgram,
): GeneralizedCourse[] {
  const explicitCourses = requirement.courseOptions ?? []

  if (explicitCourses.length > 0) {
    return explicitCourses
  }

  return expandCreditRequirement(requirement, program)
}

export function expandProgramRequirements(
  program: AcademicProgram,
): GeneralizedCourse[] {
  return program.requirements.flatMap((requirement) =>
    expandRequirement(requirement, program),
  )
}
