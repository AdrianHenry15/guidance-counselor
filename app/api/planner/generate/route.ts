import { NextResponse } from "next/server"
import { generateAcademicPlan } from "@/lib/planner/generate-plan"
import type { StudentAcademicPlan } from "@/types/academic.type"
import type { GeneratePlanOptions } from "@/types/planner.type"
import type { TranscriptCourse } from "@/types/transcript.type"
import { computerScienceBachelorProgram } from "@/data/degree.data"

/**
 * Expected request body for academic-plan generation.
 *
 * `transcriptCourses` contains the reviewed transcript data.
 * `options` is optional so callers can submit only the preferences
 * they want to override.
 */
interface GeneratePlanRequest {
  transcriptCourses: TranscriptCourse[]
  options?: Partial<GeneratePlanOptions>
}

/**
 * Standard response shape returned by this endpoint.
 *
 * A successful response includes a generated plan.
 * Failed responses include a user-facing error message.
 */
interface GeneratePlanResponse {
  success: boolean
  plan?: StudentAcademicPlan
  error?: string
}

/**
 * Fallback planner preferences used when the client does not submit
 * one or more scheduling options.
 */
const defaultOptions: GeneratePlanOptions = {
  startTerm: "fall",
  startYear: 2027,
  fallSpringCreditTarget: 12,
  summerCreditTarget: 6,
  includeSummer: true,
}

/**
 * Generates a deterministic academic plan from reviewed transcript courses.
 *
 * Processing flow:
 *
 * 1. Parse and validate the request body.
 * 2. Confirm that at least one passed course is included.
 * 3. Merge submitted preferences with server defaults.
 * 4. Generate the plan against the current generalized degree program.
 * 5. Return the completed plan to the client.
 */
export async function POST(
  request: Request,
): Promise<NextResponse<GeneratePlanResponse>> {
  try {
    /**
     * The body is cast to the expected request type after parsing.
     *
     * The endpoint still performs runtime checks below because TypeScript
     * types do not validate untrusted HTTP input.
     */
    const body = (await request.json()) as GeneratePlanRequest

    /**
     * Reject malformed requests that do not provide a transcript-course array.
     */
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

    /**
     * Only passed courses explicitly included by the user are eligible
     * to satisfy degree requirements.
     */
    const includedCourses = body.transcriptCourses.filter(
      (course) => course.completionStatus === "passed" && course.includedInPlan,
    )

    /**
     * Plan generation requires at least one eligible transcript course.
     *
     * This prevents generating a personalized plan from an empty or fully
     * excluded transcript review.
     */
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

    /**
     * Merge client-selected preferences with server-side defaults.
     *
     * This keeps the API resilient when an older client omits newer options.
     */
    const options: GeneratePlanOptions = {
      ...defaultOptions,
      ...body.options,
    }

    /**
     * Generate a complete semester-by-semester plan using the current
     * generalized Computer Science bachelor's program.
     *
     * The planner is deterministic and should produce equivalent results
     * for equivalent transcript data and scheduling preferences.
     */
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
    /**
     * Log the original server error for development and observability.
     *
     * The client receives a generic message so internal implementation
     * details are not exposed through the API response.
     */
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
