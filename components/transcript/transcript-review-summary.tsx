import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface TranscriptReviewSummaryProps {
  fileName: string
  detectedCourseCount: number
  includedCourseCount: number
  earnedCredits: number
  isGenerating: boolean
  generationError: string
  onGenerate: () => void
}

export function TranscriptReviewSummary({
  fileName,
  detectedCourseCount,
  includedCourseCount,
  earnedCredits,
  isGenerating,
  generationError,
  onGenerate,
}: TranscriptReviewSummaryProps) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-text-primary">
            {fileName}
          </h2>

          <p className="mt-1 text-sm text-text-secondary">
            {detectedCourseCount} courses detected · {includedCourseCount}{" "}
            included · {earnedCredits} credits earned
          </p>
        </div>

        <Button
          onClick={onGenerate}
          disabled={!includedCourseCount}
          loading={isGenerating}
          loadingText="Generating plan...">
          Generate academic plan
        </Button>
      </div>

      {generationError ? (
        <p className="mt-4 text-sm font-medium text-danger-600">
          {generationError}
        </p>
      ) : null}
    </Card>
  )
}
