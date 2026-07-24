import { computerScienceBachelorProgram } from "@/data/degree.data"
import type { AcademicProgram } from "@/types/degree.type"

/**
 * Programs currently available for academic-plan generation.
 */
export const academicPrograms: AcademicProgram[] = [
  computerScienceBachelorProgram,
]

/**
 * Finds a program by its stable identifier.
 */
export function getAcademicProgram(
  programId: string,
): AcademicProgram | undefined {
  return academicPrograms.find((program) => program.id === programId)
}
