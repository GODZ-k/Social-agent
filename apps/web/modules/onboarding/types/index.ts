/** Types the onboarding screens use and the API never sees. */

export interface AnswerRow {
  id: string;
  label: string;
  answer: string | undefined;
  /** Set once answered; "agency" shows "Answered by the agency" (2026-09-28). */
  answeredBy?: "agency" | "client";
}
