import { NextResponse } from "next/server"

import { RequestValidationError } from "@/lib/api/request-validation-error"
import { generateAcademicPlan } from "@/lib/planner/generate-plan"
import { validateGeneratePlanRequest } from "@/lib/planner/validate-generate-plan-request"
import type { StudentAcademicPlan } from "@/types/academic.type"
import { getAcademicProgram } from "@/data/program"

/**
 * Standard response returned by the plan-generation endpoint.
 */
interface GeneratePlanResponse {
  success: boolean
  plan?: StudentAcademicPlan
  error?: string
}

/**
 * Generates an academic plan from reviewed transcript data.
 */
export async function POST(
  request: Request,
): Promise<NextResponse<GeneratePlanResponse>> {
  try {
    /**
     * HTTP request data is untrusted until runtime validation succeeds.
     */
    const body = (await request.json()) as unknown

    if (typeof body !== "object" || body === null) {
      throw new RequestValidationError("The request body is invalid.", 400)
    }

    const { transcriptCourses, options } = validateGeneratePlanRequest(body)

    const program = getAcademicProgram(options.programId)

    if (!program) {
      throw new RequestValidationError(
        "The selected academic program could not be found.",
      )
    }

    const plan = generateAcademicPlan({
      program,
      transcriptCourses,
      options,
    })

    return NextResponse.json({
      success: true,
      plan,
    })
  } catch (error) {
    /**
     * Return validation failures without exposing internal server details.
     */
    if (error instanceof RequestValidationError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        {
          status: error.status,
        },
      )
    }

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
