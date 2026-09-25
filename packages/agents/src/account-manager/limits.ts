/** How long an intake may be: the owner asked for 6-8 questions and about 3 minutes. */
export const INTAKE_LIMITS = {
  MIN_QUESTIONS: 5,
  MAX_QUESTIONS: 8,
  MAX_QUESTION_WORDS: 14,
  MAX_FOLLOW_UPS: 3,
} as const;
