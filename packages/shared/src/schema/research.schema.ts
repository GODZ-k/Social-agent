import { z } from "zod";
import { platformSchema } from "./brand.schema.js";
import { questionnaireQuestionSchema } from "./questionnaire.schema.js";

/*
 * Business discovery: what the Growth Consultant and the Audience Researcher return, and how
 * the API reports a research run. Research is versioned and never edited; a re-run writes the
 * next version.
 */

export const researchStatusSchema = z.enum(["queued", "running", "done", "failed"]);

/** The workflow's step ids, in order. The strategy screen shows progress by them. */
export const researchStepIdSchema = z.enum(["gather", "diagnose", "profile", "save"]);

export const researchKindSchema = z.enum(["growth_brief", "audience_profile"]);

export const bottleneckKindSchema = z.enum(["awareness", "trust", "conversion", "repeat", "orderValue"]);

export const confidenceLevelSchema = z.enum(["high", "medium", "low"]);

/** What the business is, what holds it back, and what social media should do about it. */
export const growthBriefSchema = z.object({
  businessModel: z.object({
    sells: z.string(),
    toWhom: z.string(),
    howMoneyIsMade: z.string(),
  }),
  bottleneck: z.object({ kind: bottleneckKindSchema, why: z.string() }),
  /** One sentence: the lever social media should pull. */
  growthLever: z.string(),
  priorityOffers: z.array(z.object({ name: z.string(), why: z.string() })).max(5),
  kpis: z.array(z.object({ name: z.string(), target: z.string().optional(), why: z.string() })).min(1).max(5),
  competitors: z.array(z.object({ name: z.string(), url: z.string().optional(), note: z.string() })).max(6),
  /** Where this brand can win. */
  opening: z.string(),
  constraints: z.array(z.string()),
  /** What the owner must still answer. Never guessed. */
  openQuestions: z.array(z.string()),
  confidence: z.object({ level: confidenceLevelSchema, why: z.string() }),
});

export const audienceSegmentProfileSchema = z.object({
  name: z.string(),
  summary: z.string(),
  pains: z.array(z.string()),
  desires: z.array(z.string()),
  objections: z.array(z.string()),
  /** Verbatim customer phrases, each with where it was read. */
  language: z.array(z.object({ phrase: z.string(), source: z.string() })),
  platforms: z.array(platformSchema),
  contentThatLands: z.array(z.string()),
  /** What tips this segment into buying. */
  triggers: z.array(z.string()),
  basis: z.enum(["evidence", "hypothesis"]),
});

export const audienceProfileSchema = z.object({
  segments: z.array(audienceSegmentProfileSchema).min(2).max(4),
  /** Who follows today vs who the business wants; "unknown until accounts are connected" when so. */
  followerGap: z.string(),
  competitorAudienceNotes: z.array(z.string()),
});

/** One stored version of a research document. */
export const researchVersionSchema = <T extends z.ZodTypeAny>(content: T) =>
  z.object({
    version: z.number().int().positive(),
    content,
    /** The URLs the agent read, for the owner to check. */
    sources: z.array(z.string()),
    createdAt: z.string(),
  });

/** The research state of one brand as the API returns it. `status` is null when nothing has run. */
export const researchSchema = z.object({
  brandId: z.uuid(),
  status: researchStatusSchema.nullable(),
  currentStep: researchStepIdSchema.nullable(),
  error: z.string().nullable(),
  growthBrief: researchVersionSchema(growthBriefSchema).nullable(),
  audienceProfile: researchVersionSchema(audienceProfileSchema).nullable(),
  startedAt: z.string().nullable(),
  finishedAt: z.string().nullable(),
});

export type ResearchStatus = z.infer<typeof researchStatusSchema>;
export type ResearchStepId = z.infer<typeof researchStepIdSchema>;
export type ResearchKind = z.infer<typeof researchKindSchema>;
export type GrowthBrief = z.infer<typeof growthBriefSchema>;
export type AudienceSegmentProfile = z.infer<typeof audienceSegmentProfileSchema>;
export type AudienceProfile = z.infer<typeof audienceProfileSchema>;
export type Research = z.infer<typeof researchSchema>;

/** What approving a questionnaire answers: research started, or the Account Manager's follow-up questions. */
export const questionnaireSubmitResponseSchema = z.discriminatedUnion("approved", [
  z.object({ approved: z.literal(true), research: researchSchema }),
  z.object({
    approved: z.literal(false),
    /** The Account Manager's reason, in one plain sentence. */
    reason: z.string(),
    /** True after the second review: no new questions; answer the reopened ones again. */
    final: z.boolean(),
    /** New questions to answer (first review only). */
    followUps: z.array(questionnaireQuestionSchema),
    /** Existing question ids to show again (final review). */
    reopen: z.array(z.string()),
  }),
]);

export type QuestionnaireSubmitResponse = z.infer<typeof questionnaireSubmitResponseSchema>;
