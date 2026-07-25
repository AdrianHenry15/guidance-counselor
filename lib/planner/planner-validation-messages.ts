/**
 * Stable user-facing messages for plan request validation.
 */
export const plannerValidationMessages = {
  transcriptCoursesMissing: "Transcript courses were not provided.",

  completedCourseRequired:
    "Include at least one completed course before generating a plan.",

  includedCourseTitleRequired: "Every included course must have a title.",

  includedCourseCreditsRequired:
    "Every included course must have a credit value greater than zero.",

  invalidProgram: "The selected academic program is invalid.",

  invalidPriorCredential: "The selected prior credential is invalid.",

  invalidStartTerm: "The selected starting term is invalid.",

  invalidFallSpringCredits: "Fall and spring credits must be between 1 and 21.",

  invalidSummerCredits: "Summer credits must be between 1 and 12.",

  disabledSummerStart:
    "A plan cannot start in summer when summer courses are disabled.",
} as const
