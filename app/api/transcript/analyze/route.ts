import { randomUUID } from "crypto"
import { NextResponse } from "next/server"

import { parseTranscriptText } from "@/lib/transcript/parse-transcript-text"
import type {
  AnalyzeTranscriptResponse,
  TranscriptAnalysis,
  TranscriptCourse,
  TranscriptFileType,
} from "@/types/transcript.type"

function getFileType(file: File): TranscriptFileType {
  if (file.type === "application/pdf") {
    return "pdf"
  }

  if (file.type.startsWith("image/")) {
    return "image"
  }

  if (file.type === "text/csv" || file.name.toLowerCase().endsWith(".csv")) {
    return "csv"
  }

  return "text"
}

function createDevelopmentCourses(): TranscriptCourse[] {
  return [
    {
      id: randomUUID(),
      originalName: "ENC 1101 English Composition I",
      normalizedTitle: "English Composition I",
      subjectArea: "english",
      credits: 3,
      grade: "A",
      completed: true,
      confidence: 0.94,
    },
    {
      id: randomUUID(),
      originalName: "ENC 1102 English Composition II",
      normalizedTitle: "English Composition II",
      subjectArea: "english",
      credits: 3,
      grade: "B",
      completed: true,
      confidence: 0.94,
    },
    {
      id: randomUUID(),
      originalName: "MAC 1105 College Algebra",
      normalizedTitle: "College Algebra",
      subjectArea: "mathematics",
      credits: 3,
      grade: "B",
      completed: true,
      confidence: 0.9,
    },
    {
      id: randomUUID(),
      originalName: "COP 1000C Intro to Programming",
      normalizedTitle: "Introductory Programming",
      subjectArea: "computer_science",
      credits: 3,
      grade: "A",
      completed: true,
      confidence: 0.91,
    },
    {
      id: randomUUID(),
      originalName: "PSY 2012 General Psychology",
      normalizedTitle: "Social Science Elective",
      subjectArea: "social_science",
      credits: 3,
      grade: "A",
      completed: true,
      confidence: 0.86,
    },
  ]
}

export async function POST(
  request: Request,
): Promise<NextResponse<AnalyzeTranscriptResponse>> {
  try {
    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: "No transcript file was provided.",
        },
        {
          status: 400,
        },
      )
    }

    const fileType = getFileType(file)

    let courses: TranscriptCourse[]
    const warnings: string[] = []

    if (fileType === "text" || fileType === "csv") {
      const text = await file.text()
      courses = parseTranscriptText(text)

      if (!courses.length) {
        return NextResponse.json(
          {
            success: false,
            error: "No recognizable course lines were found in the file.",
          },
          {
            status: 422,
          },
        )
      }
    } else {
      courses = createDevelopmentCourses()

      warnings.push(
        "PDF and image extraction is currently using development sample data. Review all detected courses before generating your plan.",
      )
    }

    const completedCredits = courses
      .filter((course) => course.completed)
      .reduce((total, course) => total + course.credits, 0)

    const analysis: TranscriptAnalysis = {
      id: randomUUID(),
      fileName: file.name,
      fileType,
      educationLevel: "college",
      estimatedCreditsEarned: completedCredits,
      courses,
      warnings,
      analyzedAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      analysis,
    })
  } catch (error) {
    console.error("Transcript analysis failed:", error)

    return NextResponse.json(
      {
        success: false,
        error: "The transcript could not be analyzed.",
      },
      {
        status: 500,
      },
    )
  }
}
