import type { Agent } from "@mastra/core/agent";
import { MastraError } from "@mastra/core/error";
import type { RequestContext } from "@mastra/core/request-context";
import { ZodError, type z } from "zod";

// One structured-output call per agent per run, retried once and only when the model's answer was
// the problem. Shared by every workflow step that asks an agent for data.

/** How much of a rejected answer is quoted back to the model on the one retry. */
const REJECTION_NOTE_CHARS = 1_000;

export type StructuredAgent = Pick<Agent, "generate">;

export type JsonPromptInjection = boolean | "system" | "inline" | "auto";

/**
 * How the schema reaches an Anthropic model when the agent also has tools. Probed on 2026-09-22
 * (apps/api/testing/discovery-probe.ts): "auto" keeps native structured output where Mastra's capability
 * data allows it and falls back to inline prompt injection otherwise.
 */
export const DEFAULT_JSON_PROMPT_INJECTION: JsonPromptInjection = "auto";

export type GenerateStructuredOptions<T> = {
  /** Carries per-run state (a research budget) to the agent's tools. */
  requestContext?: RequestContext;
  /** The cap on model calls in a tool loop. Omitted for agents without tools. */
  maxSteps?: number;
  /** Called once, with the rejection, before the single retry. */
  onRejected: (message: string) => void;
  jsonPromptInjection?: JsonPromptInjection;
  /** An extra check on the first answer only; throw `AnswerRejectedError` to earn the retry. */
  checkFirstAnswer?: (value: T) => void;
};

/** A valid answer that failed a step's own check (voice quotes not on the site, for example). */
export class AnswerRejectedError extends Error {
  override name = "AnswerRejectedError";
}

/** What Mastra's strict structured-output strategy throws when the answer does not fit the schema. */
const STRUCTURED_OUTPUT_FAILURE_IDS = ["STRUCTURED_OUTPUT_SCHEMA_VALIDATION_FAILED", "STRUCTURED_OUTPUT_OBJECT_UNDEFINED"];

/**
 * The AI SDK's parse errors, which Mastra passes through untouched. Matched by name because `ai` is
 * not a dependency here — the same three Mastra's own `isStructuredOutputFormatError` checks.
 */
const AI_SDK_FORMAT_ERROR_NAMES = ["AI_JSONParseError", "AI_NoObjectGeneratedError", "AI_TypeValidationError"];

/**
 * True only when the model's answer was the problem: our zod parse, Mastra's strict structured-output
 * error, or an AI SDK parse error. Anything else — 401, rate limit, socket — is rethrown, never
 * retried or quoted back to the model.
 */
export function isAnswerRejected(error: unknown): error is Error {
  if (error instanceof ZodError || error instanceof AnswerRejectedError) return true;
  if (error instanceof MastraError) return STRUCTURED_OUTPUT_FAILURE_IDS.includes(error.id);
  return error instanceof Error && AI_SDK_FORMAT_ERROR_NAMES.includes(error.name);
}

/** The `structuredOutput` argument of `agent.generate`, the same for every agent here. */
export function structuredOutputFor<T>(schema: z.ZodType<T>, jsonPromptInjection: JsonPromptInjection = DEFAULT_JSON_PROMPT_INJECTION) {
  return { schema, errorStrategy: "strict" as const, jsonPromptInjection };
}

/** One model call, validated. Throws a rejection for a bad answer and anything else untouched. */
async function generateOnce<T>(agent: StructuredAgent, prompt: string, schema: z.ZodType<T>, options: GenerateStructuredOptions<T>): Promise<T> {
  const structuredOutput = structuredOutputFor(schema, options.jsonPromptInjection);
  const response = await agent.generate(prompt, {
    structuredOutput,
    ...(options.requestContext ? { requestContext: options.requestContext } : {}),
    ...(options.maxSteps ? { maxSteps: options.maxSteps } : {}),
  });
  return schema.parse(response.object);
}

function rejectionNote(error: Error): string {
  return `Your previous answer was rejected: ${error.message.slice(0, REJECTION_NOTE_CHARS)}\nAnswer again and follow the schema exactly.`;
}

/**
 * One call per run. A second happens only when the first answer failed validation or the step's
 * own check, with the rejection quoted back to the model; every other failure is rethrown.
 */
export async function generateStructured<T>(
  agent: StructuredAgent,
  prompt: string,
  schema: z.ZodType<T>,
  options: GenerateStructuredOptions<T>,
): Promise<T> {
  try {
    const first = await generateOnce(agent, prompt, schema, options);
    options.checkFirstAnswer?.(first);
    return first;
  } catch (error) {
    if (!isAnswerRejected(error)) throw error;
    options.onRejected(error.message);
    return generateOnce(agent, `${prompt}\n\n${rejectionNote(error)}`, schema, options);
  }
}
