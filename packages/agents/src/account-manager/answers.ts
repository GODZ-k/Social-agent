import {
  businessTypeSchema,
  questionnaireGoalSchema,
  languageSchema,
  NOT_SURE,
  type BusinessType,
  type QuestionnaireGoal,
  type QuestionnaireQuestion,
  type QuestionnaireSession,
  type Language,
  type MoneyRange,
} from "@social-agent/shared";

/** The facts the owner gave by tapping an option: code reads these, never the model. */
export type TappedFacts = {
  businessType?: BusinessType;
  postLanguage?: Language;
  goalKind?: QuestionnaireGoal["kind"];
  orderValue?: MoneyRange;
};

export function allQuestions(session: QuestionnaireSession): QuestionnaireQuestion[] {
  return [...session.questions, ...session.followUps];
}

/** What is wrong with each answer: an unknown question, a skipped required one, a value not among the options. */
export function answerProblems(answers: Record<string, string>, session: QuestionnaireSession): string[] {
  const entries = allQuestions(session).map((question) => [question.id, question] as const);
  const questions = new Map(entries);
  return Object.entries(answers).flatMap(([id, value]) => {
    const question = questions.get(id);
    if (!question) return [`${id}: no such question`];
    if (value.trim() === "") return [`${id}: empty`];
    if (value === NOT_SURE) return question.required ? [`${id}: this question needs an answer`] : [];
    const needsOption = question.kind === "choice" || question.kind === "range";
    const isOption = question.options?.some((option) => option.value === value) ?? false;
    return needsOption && !isOption ? [`${id}: not one of the options`] : [];
  });
}

export function unansweredRequired(session: QuestionnaireSession): string[] {
  return allQuestions(session)
    .filter((question) => question.required && !session.answers[question.id])
    .map((question) => question.id);
}

function chosenOption(question: QuestionnaireQuestion, session: QuestionnaireSession) {
  const answer = session.answers[question.id];
  if (!answer || answer === NOT_SURE) return undefined;
  return question.options?.find((option) => option.value === answer);
}

function readTapped(question: QuestionnaireQuestion, value: string, facts: TappedFacts): void {
  for (const key of question.covers) {
    if (key === "businessType" && businessTypeSchema.safeParse(value).success) facts.businessType = value as BusinessType;
    if (key === "postLanguage" && languageSchema.safeParse(value).success) facts.postLanguage = value as Language;
    if (key === "goal" && questionnaireGoalSchema.shape.kind.safeParse(value).success) facts.goalKind = value as QuestionnaireGoal["kind"];
  }
}

/** Later answers (follow-ups) win over earlier ones for the same fact. */
export function tappedFacts(session: QuestionnaireSession): TappedFacts {
  const facts: TappedFacts = {};
  for (const question of allQuestions(session)) {
    const option = chosenOption(question, session);
    if (!option) continue;
    if (question.kind === "choice") readTapped(question, option.value, facts);
    if (question.kind === "range" && question.covers.includes("orderValue") && question.currency) {
      facts.orderValue = { min: option.min, max: option.max, currency: question.currency };
    }
  }
  return facts;
}

/** The asked questions a rejected final review points at, through the facts its follow-ups cover. */
export function questionsToReopen(session: QuestionnaireSession, followUps: QuestionnaireQuestion[]): string[] {
  const keys = followUps.flatMap((question) => question.covers);
  const facts = new Set(keys);
  const matching = allQuestions(session).filter((question) => question.covers.some((key) => facts.has(key)));
  const reopen = matching.length > 0 ? matching : allQuestions(session).filter((question) => question.required);
  return reopen.map((question) => question.id);
}
