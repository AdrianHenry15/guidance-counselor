/**
 * Warning messages produced during transcript extraction or parsing.
 */
interface TranscriptWarningsProps {
  warnings: string[]
}

/**
 * Displays non-fatal transcript analysis warnings.
 */
export function TranscriptWarnings({ warnings }: TranscriptWarningsProps) {
  if (!warnings.length) {
    return null
  }

  return (
    <div className="space-y-3">
      {warnings.map((warning) => (
        <div
          key={warning}
          className="rounded-xl border border-warning-500/30 p-4 text-sm leading-6 dark:bg-warning-700/15 dark:text-amber-200">
          {warning}
        </div>
      ))}
    </div>
  )
}
