import type { RequestContext } from "@mastra/core/request-context";
import type { z } from "zod";
import { config } from "@/config/constants";
import { generateStructured, isAnswerRejected, type StructuredAgent } from "@social-agent/agents";

type AskOptions = {
  requestContext: RequestContext;
  logger?: { warn: (message: string) => void };
};

/**
 * One research agent's answer, or undefined when the model's answer was rejected twice: the step
 * then returns a research failure. Any other error is rethrown, so the workflow fails.
 */
export async function askResearchAgent<T>(
  stepId: "diagnose" | "profile",
  agent: StructuredAgent,
  prompt: string,
  schema: z.ZodType<T>,
  { requestContext, logger }: AskOptions,
): Promise<T | undefined> {
  try {
    return await generateStructured(agent, prompt, schema, {
      requestContext,
      maxSteps: config.research.MAX_AGENT_STEPS,
      onRejected: (message: string) => {
        logger?.warn(`business-discovery ${stepId}: the model's answer was rejected, asking once more: ${message}`);
      },
    });
  } catch (error) {
    if (!isAnswerRejected(error)) throw error;
    logger?.warn(`business-discovery ${stepId}: the model's second answer was rejected too: ${error.message}`);
    return undefined;
  }
}
