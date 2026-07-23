import { NextResponse } from "next/server"

import { generateAcademicPlan } from "@/lib/planner/generate-plan"
import type { StudentAcademicPlan } from "@/types/academic.type"
import type { GeneratePlanOptions } from "@/types/planner.type"
import type { TranscriptCourse } from "@/types/transcript.type"
import { computerScienceBachelorProgram } from "@/data/degree.data"

interface GeneratePlanRequest {
  transcriptCourses: TranscriptCourse[]
  options?: Partial<GeneratePlanOptions>
}

interface GeneratePlanResponse {
  success: boolean
  plan?: StudentAcademicPlan
  error?: string
}

const defaultOptions: GeneratePlanOptions = {
  startTerm: "fall",
  startYear: 2027,
  fallSpringCreditTarget: 12,
  summerCreditTarget: 6,
  includeSummer: true,
}

export async function POST(
  request: Request,
): Promise<NextResponse<GeneratePlanResponse>> {
  try {
    const body = (await request.json()) as GeneratePlanRequest

    if (!Array.isArray(body.transcriptCourses)) {
      return NextResponse.json(
        {
          success: false,
          error: "Transcript courses were not provided.",
        },
        {
          status: 400,
        },
      )
    }

    const includedCourses = body.transcriptCourses.filter(
      (course) => course.completed,
    )

    if (!includedCourses.length) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Include at least one completed course before generating a plan.",
        },
        {
          status: 422,
        },
      )
    }

    const options: GeneratePlanOptions = {
      ...defaultOptions,
      ...body.options,
    }

    const plan = generateAcademicPlan({
      program: computerScienceBachelorProgram,
      transcriptCourses: body.transcriptCourses,
      options,
    })

    return NextResponse.json({
      success: true,
      plan,
    })
  } catch (error) {
    console.error("Academic plan generation failed:", error)

    return NextResponse.json(
      {
        success: false,
        error: "The academic plan could not be generated.",
      },
      {
        status: 500,
      },
    )
  }
}
