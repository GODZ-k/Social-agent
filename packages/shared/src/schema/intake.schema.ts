import { z } from "zod";

/*
 * The guided intake: what the Account Manager asks after the brand kit is saved, and what it
 * approves before business discovery may start. Answers are data in prompts, never instructions.
 */

/** Languages the Account Manager and the posts support now. Hinglish is Hindi in English letters. */
export const languageSchema = z.enum(["en", "hi", "hinglish"]);

export const businessTypeSchema = z.enum(["product", "service", "both"]);

/** One free-text intake answer. */
const intakeAnswer = z.string().trim().max(2_000);

export const intakeGoalSchema = z.object({
  kind: z.enum(["more_customers", "repeat_customers", "bigger_orders", "launch", "awareness"]),
  note: intakeAnswer.optional(),
});

/** A money range in the brand's own currency, kept as numbers so brands can be compared. */
export const moneyRangeSchema = z.object({
  min: z.number().nonnegative().optional(),
  max: z.number().positive().optional(),
  currency: z.string().length(3),
});

export const intakeKeySchema = z.enum([
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
export const REQUIRED_INTAKE_KEYS = ["offer", "businessType", "goal", "postLanguage", "idealCustomer"] as const;

/** What the owner told us that a website cannot, after the Account Manager's review. */
export const intakeSchema = z.object({
  offer: intakeAnswer.min(1),
  businessType: businessTypeSchema,
  goal: intakeGoalSchema,
  postLanguage: languageSchema,
  idealCustomer: intakeAnswer.min(1),
  bestSellers: intakeAnswer.optional(),
  capacity: intakeAnswer.optional(),
  orderValue: moneyRangeSchema.optional(),
  competitors: intakeAnswer.optional(),
  constraints: intakeAnswer.optional(),
  /** Answers to the questions written for this brand only, for the Growth Consultant. */
  notes: z.array(z.object({ question: intakeAnswer, answer: intakeAnswer })).max(6).default([]),
});

/** The same facts, all optional: what the review reads from the answers before code checks them. */
export const intakeDraftSchema = intakeSchema.partial();

const questionOption = z.object({
  value: z.string().min(1).max(60),
  label: z.string().min(1).max(80),
  min: z.number().nonnegative().optional(),
  max: z.number().positive().optional(),
});

export const intakeQuestionSchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9]{0,11}$/),
  /** The facts this question answers; empty for a question written for this brand only. */
  covers: z.array(intakeKeySchema),
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
export const intakeQuestionListSchema = z.object({ questions: z.array(intakeQuestionSchema) });

/** The answer to an optional question the owner cannot answer. */
export const NOT_SURE = "not_sure";

export const intakeSessionSchema = z.object({
  /** New for every question list: a screen holding an older list is refused instead of answering the wrong questions. */
  sessionId: z.uuid(),
  chatLanguage: languageSchema,
  questions: z.array(intakeQuestionSchema),
  /** Keyed by question id. */
  answers: z.record(z.string(), intakeAnswer),
  followUps: z.array(intakeQuestionSchema).default([]),
  updatedAt: z.string(),
});

/** What the Account Manager returns when it reviews the answers: the facts, and approval or follow-ups. */
export const intakeReviewSchema = z.object({
  approved: z.boolean(),
  reason: z.string().max(300),
  intake: intakeDraftSchema,
  followUps: z.array(intakeQuestionSchema).max(3),
});

export const intakeStateSchema = z.object({
  status: z.enum(["not_started", "in_progress", "approved"]),
  session: intakeSessionSchema.nullable(),
  approvedAt: z.string().nullable(),
});

export const intakeQuestionsRequestSchema = z.object({ chatLanguage: languageSchema });

export const intakeAnswersRequestSchema = z.object({ sessionId: z.uuid(), answers: z.record(z.string(), intakeAnswer) });

/** `sessionId` is the answered session; an intake edited in Settings is approved without one. */
export const intakeApproveRequestSchema = z.object({ sessionId: z.uuid().optional() });
