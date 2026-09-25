import { z } from "zod";
import { audienceProfileSchema, brandContextSchema, growthBriefSchema, researchStepIdSchema } from "@social-agent/shared";

/** Stable ids: the strategy screen shows progress by them. One source of truth: the shared schema. */
export const RESEARCH_STEP_IDS = researchStepIdSchema.options;

export const researchErrorCodeSchema = z.enum(["INTAKE_REQUIRED", "RESEARCH_FAILED"]);
export type ResearchErrorCode = z.infer<typeof researchErrorCodeSchema>;

/** Shown to the business owner on the strategy screen, so: plain words. */
export const RESEARCH_MESSAGES: Record<ResearchErrorCode, string> = {
  INTAKE_REQUIRED: "Answer the intake questions before research can start.",
  RESEARCH_FAILED: "We could not finish researching your business. Please try again.",
};

export const RESEARCH_FAILURE = { code: "RESEARCH_FAILED" as const, message: RESEARCH_MESSAGES.RESEARCH_FAILED };

// A step never throws a research failure: it returns it, and the steps after it pass it along.
// Step outputs are stored in Postgres, which would reduce a thrown error to a message.
export const failureSchema = z.object({ code: researchErrorCodeSchema, message: z.string() });

// The workflow's input is the shared BrandContext, loaded by code before it starts (BrandContextService),
// so the workflow itself never touches the database.

export const diagnoseOutputSchema = z.object({
  failure: failureSchema.optional(),
  input: brandContextSchema,
  brief: growthBriefSchema.optional(),
});

export const profileOutputSchema = z.object({
  failure: failureSchema.optional(),
  brief: growthBriefSchema.optional(),
  profile: audienceProfileSchema.optional(),
});

export const discoveryFailureSchema = z.object({
  ok: z.literal(false),
  code: researchErrorCodeSchema,
  message: z.string(),
});

export const discoverySuccessSchema = z.object({
  ok: z.literal(true),
  brief: growthBriefSchema,
  profile: audienceProfileSchema,
  /** Every URL the tools actually read, for the owner to check. */
  sources: z.array(z.string()),
});

export const discoveryOutcomeSchema = z.discriminatedUnion("ok", [discoverySuccessSchema, discoveryFailureSchema]);
export type DiscoveryFailure = z.infer<typeof discoveryFailureSchema>;
export type DiscoverySuccess = z.infer<typeof discoverySuccessSchema>;
export type DiscoveryOutcome = z.infer<typeof discoveryOutcomeSchema>;
