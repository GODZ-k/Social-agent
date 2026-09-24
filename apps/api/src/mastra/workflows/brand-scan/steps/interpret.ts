import { MastraError } from "@mastra/core/error";
import { createStep } from "@mastra/core/workflows";
import { scanResultSchema, type ScanResult } from "@social-agent/shared";
import { ZodError } from "zod";
import { config } from "@/config/constants";
import type { SiteFacts } from "@/scan/types";
import { brandAnalyst } from "@/mastra/agents/brand-analyst/agent";
import { brandAnalysisSchema, type BrandAnalysis } from "@/mastra/agents/brand-analyst/output.schema";
import { renderSiteFacts } from "@/mastra/agents/brand-analyst/prompt";
import { interpretOutputSchema, readPagesOutputSchema } from "../schemas";

type BrandAnalystAgent = Pick<typeof brandAnalyst, "generate">;

/** The model's judgement plus the facts code extracted. The model never supplies a fact. */
function assemble(analysis: BrandAnalysis, facts: SiteFacts): ScanResult {
  return scanResultSchema.parse({
    name: analysis.name.trim() || facts.nameCandidates[0],
    industry: analysis.industry.trim() || undefined,
    brand: {
      tagline: analysis.tagline,
      summary: analysis.summary,
      audience: analysis.audience,
      voice: analysis.voice,
      // Hex values and their order come from the CSS. A missing name falls back to the hex.
      colors: facts.style.colors.map((hex, index) => ({ name: analysis.colorNames[index]?.trim() || hex, hex })),
      fonts: facts.style.fonts,
      aesthetic: analysis.aesthetic,
      keywords: analysis.keywords,
    },
    ...(facts.business ? { business: facts.business } : {}),
  });
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
function isAnswerRejected(error: unknown): error is Error {
  if (error instanceof ZodError) return true;
  if (error instanceof MastraError) return STRUCTURED_OUTPUT_FAILURE_IDS.includes(error.id);
  return error instanceof Error && AI_SDK_FORMAT_ERROR_NAMES.includes(error.name);
}

/** One model call, validated. Throws a rejection for a bad answer and anything else untouched. */
async function analyse(agent: BrandAnalystAgent, prompt: string): Promise<BrandAnalysis> {
  const response = await agent.generate(prompt, {
    structuredOutput: { schema: brandAnalysisSchema, errorStrategy: "strict" },
  });
  return brandAnalysisSchema.parse(response.object);
}

function rejectionNote(error: Error): string {
  return `Your previous answer was rejected: ${error.message.slice(0, config.brandAnalyst.REJECTION_NOTE_CHARS)}\nAnswer again and follow the schema exactly.`;
}

/**
 * One call per scan. A second happens only when the first answer failed validation, with the
 * rejection quoted back to the model; every other failure is rethrown, so the workflow fails.
 */
async function analyseWithOneRetry(
  agent: BrandAnalystAgent,
  prompt: string,
  onRejected: (message: string) => void,
): Promise<BrandAnalysis> {
  try {
    return await analyse(agent, prompt);
  } catch (error) {
    if (!isAnswerRejected(error)) throw error;
    onRejected(error.message);
    return analyse(agent, `${prompt}\n\n${rejectionNote(error)}`);
  }
}

export const interpretStep = createStep({
  id: "interpret",
  description: "The Brand Analyst turns the facts into a brand kit. Code then adds the contact details, colour values and fonts it extracted.",
  inputSchema: readPagesOutputSchema,
  outputSchema: interpretOutputSchema,
  execute: async ({ inputData, mastra }) => {
    const { facts, warnings } = inputData;
    if (inputData.failure || !facts) return { failure: inputData.failure, pages: [], warnings };

    const pages = facts.pages.map((page) => ({ url: page.url, title: page.title }));
    const agent = mastra?.getAgent("brandAnalyst") ?? brandAnalyst;
    const logger = mastra?.getLogger();

    try {
      const analysis = await analyseWithOneRetry(agent, renderSiteFacts(facts), (message) => {
        logger?.warn(`brand-scan interpret: the model's answer was rejected, asking once more: ${message}`);
      });
      return { result: assemble(analysis, facts), pages, warnings };
    } catch (error) {
      if (!isAnswerRejected(error)) throw error;
      logger?.warn(`brand-scan interpret: the model's second answer was rejected too: ${error.message}`);
      return { failure: { code: "INTERPRETATION_FAILED" as const, message: config.scan.MESSAGES.INTERPRETATION_FAILED }, pages, warnings };
    }
  },
});
