import {
  businessTypeSchema,
  intakeGoalSchema,
  languageSchema,
  REQUIRED_INTAKE_KEYS,
  type IntakeKey,
  type IntakeQuestion,
} from "@social-agent/shared";
import { INTAKE_LIMITS } from "./limits.js";

/** Facts whose answer code reads straight from a tapped option, so the options must be the schema's own values. */
const ENUM_FACTS: Partial<Record<IntakeKey, readonly string[]>> = {
  businessType: businessTypeSchema.options,
  postLanguage: languageSchema.options,
  goal: intakeGoalSchema.shape.kind.options,
};

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).length;
}

function coversRequired(question: IntakeQuestion): boolean {
  return question.covers.some((key) => (REQUIRED_INTAKE_KEYS as readonly string[]).includes(key));
}

function missingRequiredFacts(questions: IntakeQuestion[]): string[] {
  const covered = new Set(questions.flatMap((question) => question.covers));
  return REQUIRED_INTAKE_KEYS.filter((key) => !covered.has(key));
}

function enumProblems(question: IntakeQuestion): string[] {
  if (question.kind !== "choice") return [];
  return question.covers.flatMap((key) => {
    const allowed = ENUM_FACTS[key];
    if (!allowed) return [];
    const wrong = (question.options ?? []).filter((option) => !allowed.includes(option.value)).map((option) => option.value);
    return wrong.length > 0 ? [`${question.id}: option values for ${key} must be ${allowed.join(" | ")}, not ${wrong.join(", ")}`] : [];
  });
}

function questionProblems(question: IntakeQuestion): string[] {
  const problems: string[] = [];
  if (wordCount(question.text) > INTAKE_LIMITS.MAX_QUESTION_WORDS) {
    problems.push(`${question.id}: longer than ${INTAKE_LIMITS.MAX_QUESTION_WORDS} words`);
  }
  const needsOptions = question.kind === "choice" || question.kind === "range";
  if (needsOptions && (question.options?.length ?? 0) < 2) {
    problems.push(`${question.id}: a ${question.kind} question needs at least 2 options`);
  }
  if (question.kind === "confirm" && !question.prefill) {
    problems.push(`${question.id}: a confirm question needs the prefill it confirms`);
  }
  if (question.kind === "range" && !question.currency) {
    problems.push(`${question.id}: a range question needs its currency`);
  }
  if (question.kind === "range" && question.options?.some((option) => option.min === undefined && option.max === undefined)) {
    problems.push(`${question.id}: every range option needs min or max`);
  }
  if (coversRequired(question) && !question.required) {
    problems.push(`${question.id}: covers a required fact, so it must be required`);
  }
  return [...problems, ...enumProblems(question)];
}

function duplicateIds(questions: IntakeQuestion[]): string[] {
  const ids = questions.map((question) => question.id);
  return new Set(ids).size === ids.length ? [] : ["question ids must be unique"];
}

/** What code refuses in a question list before an owner sees it. Empty means the list is fine. */
export function checkIntakeQuestions({ questions }: { questions: IntakeQuestion[] }): string[] {
  const problems: string[] = [];
  if (questions.length < INTAKE_LIMITS.MIN_QUESTIONS || questions.length > INTAKE_LIMITS.MAX_QUESTIONS) {
    problems.push(`ask ${INTAKE_LIMITS.MIN_QUESTIONS}-${INTAKE_LIMITS.MAX_QUESTIONS} questions, not ${questions.length}`);
  }
  const missing = missingRequiredFacts(questions);
  if (missing.length > 0) problems.push(`no question covers: ${missing.join(", ")}`);
  return [...problems, ...duplicateIds(questions), ...questions.flatMap(questionProblems)];
}

/** The same checks for a review's follow-ups, which must also use ids the owner has not seen yet. */
export function checkFollowUps(followUps: IntakeQuestion[], asked: IntakeQuestion[]): string[] {
  const problems: string[] = [];
  if (followUps.length > INTAKE_LIMITS.MAX_FOLLOW_UPS) problems.push(`at most ${INTAKE_LIMITS.MAX_FOLLOW_UPS} follow-ups`);
  const askedIds = new Set(asked.map((question) => question.id));
  const reused = followUps.filter((question) => askedIds.has(question.id)).map((question) => question.id);
  if (reused.length > 0) problems.push(`follow-up ids must be new (f1, f2, ...), not ${reused.join(", ")}`);
  return [...problems, ...duplicateIds(followUps), ...followUps.flatMap(questionProblems)];
}
