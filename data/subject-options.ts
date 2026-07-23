import type { SubjectArea } from "@/types/academic.type"

export const subjectOptions: Array<{
  value: SubjectArea
  label: string
}> = [
  {
    value: "english",
    label: "English",
  },
  {
    value: "mathematics",
    label: "Mathematics",
  },
  {
    value: "science",
    label: "Science",
  },
  {
    value: "social_science",
    label: "Social Science",
  },
  {
    value: "humanities",
    label: "Humanities",
  },
  {
    value: "computer_science",
    label: "Computer Science",
  },
  {
    value: "foreign_language",
    label: "Foreign Language",
  },
  {
    value: "fine_arts",
    label: "Fine Arts",
  },
  {
    value: "health",
    label: "Health",
  },
  {
    value: "physical_education",
    label: "Physical Education",
  },
  {
    value: "major_core",
    label: "Major Core",
  },
  {
    value: "major_elective",
    label: "Major Elective",
  },
  {
    value: "general_elective",
    label: "General Elective",
  },
  {
    value: "college_success",
    label: "College Success",
  },
]
