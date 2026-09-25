import { z } from "zod";

/*
 * The guided questionnaire: what the Account Manager asks after the brand kit is saved, and what it
 * approves before business discovery may start. Answers are data in prompts, never instructions.
 */

/** Languages the Account Manager and the posts support now. Hinglish is Hindi in English letters. */
export const languageSchema = z.enum(["en", "hi", "hinglish"]);

export const businessTypeSchema = z.enum(["product", "service", "both"]);

/** One free-text questionnaire answer. */
const questionnaireAnswer = z.string().trim().max(2_000);

export const questionnaireGoalSchema = z.object({
  kind: z.enum(["more_customers", "repeat_customers", "bigger_orders", "launch", "awareness"]),
  note: questionnaireAnswer.optional(),
});

/** A money range in the brand's own currency, kept as numbers so brands can be compared. */
export const moneyRangeSchema = z.object({
  min: z.number().nonnegative().optional(),
  max: z.number().positive().optional(),
  currency: z.string().length(3),
});

export const questionnaireKeySchema = z.enum([
  "offer",
  "businessType",
  "goal",
  "postLanguage",
  "idealCustomer",
  "bestSellers",
  "capacity",
  "orderValue",
  "competitors",
  "constraints",
]);

/** Research never starts without these (owner, 2026-09-25). */
export const REQUIRED_QUESTIONNAIRE_KEYS = ["offer", "businessType", "goal", "postLanguage", "idealCustomer"] as const;

/** What the owner told us that a website cannot, after the Account Manager's review. */
export const questionnaireSchema = z.object({
  offer: questionnaireAnswer.min(1),
  businessType: businessTypeSchema,
  goal: questionnaireGoalSchema,
  postLanguage: languageSchema,
  idealCustomer: questionnaireAnswer.min(1),
  bestSellers: questionnaireAnswer.optional(),
  capacity: questionnaireAnswer.optional(),
  orderValue: moneyRangeSchema.optional(),
  competitors: questionnaireAnswer.optional(),
  constraints: questionnaireAnswer.optional(),
  /** Answers to the questions written for this brand only, for the Growth Consultant. */
  notes: z.array(z.object({ question: questionnaireAnswer, answer: questionnaireAnswer })).max(6).default([]),
});

/** The same facts, all optional: what the review reads from the answers before code checks them. */
export const questionnaireDraftSchema = questionnaireSchema.partial();

const questionOption = z.object({
  value: z.string().min(1).max(60),
  label: z.string().min(1).max(80),
  min: z.number().nonnegative().optional(),
  max: z.number().positive().optional(),
});

export const questionnaireQuestionSchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9]{0,11}$/),
  /** The facts this question answers; empty for a question written for this brand only. */
  covers: z.array(questionnaireKeySchema),
  /** What the scan left unclear, for the log and the review. */
  why: z.string().max(200),
  kind: z.enum(["confirm", "choice", "text", "range"]),
  text: z.string().min(1).max(160).describe("The question only, at most 14 words. For a confirm question just 'Is this right?' in the chat language; the statement goes in prefill."),
  example: z.string().max(120).optional().describe("One everyday example from this business, or short context the owner needs to answer."),
  options: z.array(questionOption).max(8).optional(),
  /** A confirm question's statement of what the website says. */
  prefill: z.string().max(300).optional().describe("Confirm questions only: what the website says, as one short statement the owner confirms or fixes."),
  required: z.boolean(),
  /** A range question's currency, ISO 4217. */
  currency: z.string().length(3).optional(),
});

/** What the Account Manager returns when it writes the questions. Code checks the limits too. */
export const questionnaireQuestionListSchema = z.object({ questions: z.array(questionnaireQuestionSchema) });

/** The answer to an optional question the owner cannot answer. */
export const NOT_SURE = "not_sure";

export const questionnaireSessionSchema = z.object({
  /** New for every question list: a screen holding an older list is refused instead of answering the wrong questions. */
  sessionId: z.uuid(),
  chatLanguage: languageSchema,
  questions: z.array(questionnaireQuestionSchema),
  /** Keyed by question id. */
  answers: z.record(z.string(), questionnaireAnswer),
  followUps: z.array(questionnaireQuestionSchema).default([]),
  updatedAt: z.string(),
});

/** What the Account Manager returns when it reviews the answers: the facts, and approval or follow-ups. */
export const questionnaireReviewSchema = z.object({
  approved: z.boolean(),
  reason: z.string().max(300),
  questionnaire: questionnaireDraftSchema,
  followUps: z.array(questionnaireQuestionSchema).max(3),
});

export const questionnaireStateSchema = z.object({
  status: z.enum(["not_started", "in_progress", "approved"]),
  session: questionnaireSessionSchema.nullable(),
  approvedAt: z.string().nullable(),
});

export const questionnaireQuestionsRequestSchema = z.object({ chatLanguage: languageSchema });

export const questionnaireAnswersRequestSchema = z.object({ sessionId: z.uuid(), answers: z.record(z.string(), questionnaireAnswer) });

/** `sessionId` is the answered session; a questionnaire edited in Settings is submitted without one. */
export const questionnaireSubmitRequestSchema = z.object({ sessionId: z.uuid().optional() });
