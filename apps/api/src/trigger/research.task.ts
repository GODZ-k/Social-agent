import { logger, task } from "@trigger.dev/sdk";
import type { ResearchRunRow } from "@social-agent/db";
import { config } from "@/config/constants";
import { runBusinessDiscovery } from "@/mastra/workflows/business-discovery/run";
import type { DiscoverySuccess } from "@/mastra/workflows/business-discovery/schemas";
import { ResearchRepository } from "@/repositories/research.repository";
import { firecrawlLimit } from "@/trigger/limits";

export const RESEARCH_TASK_ID = "business-discovery";

/** Claims a still-queued row for this run, so a retry or a double trigger cannot research twice. */
async function claimQueued(id: string): Promise<ResearchRunRow | undefined> {
    const run = await ResearchRepository.findRunById(id);
    if (!run || run.status !== "queued") return undefined;

    await ResearchRepository.markRunning(id);
    return run;
}

/** The workflow returns the documents; the task writes them, so the workflow stays free of the database. */
async function storeOutcome(brandId: string, outcome: DiscoverySuccess): Promise<void> {
    await ResearchRepository.insertResearch({ brandId, kind: "growth_brief", content: outcome.brief, sources: outcome.sources });
    await ResearchRepository.insertResearch({ brandId, kind: "audience_profile", content: outcome.profile, sources: outcome.sources });
}

/**
 * Business discovery: the growth brief and the audience profile a strategy is built on.
 *
 * Shares `firecrawlLimit` with the scan because both spend the same 10-per-minute key, and one run
 * makes up to 24 requests. See `scan.task.ts` for why the row is marked failed in `onFailure`
 * rather than in `run`.
 */
export const businessDiscoveryTask = task({
    id: RESEARCH_TASK_ID,
    concurrency: firecrawlLimit,
    run: async ({ runId }: { runId: string }) => {
        const run = await claimQueued(runId);
        if (!run) {
            logger.info("research run is not queued any more, nothing to do", { runId });
            return { ran: false as const };
        }

        const outcome = await runBusinessDiscovery(run.brandId, { onStep: (step) => ResearchRepository.markStep(runId, step) });

        // The workflow refusing (no questionnaire yet, say) is a finished run, not a failed attempt.
        if (!outcome.ok) {
            await ResearchRepository.markFailed(runId, outcome.message);
            return { ran: true as const, ok: false as const };
        }

        await storeOutcome(run.brandId, outcome);
        await ResearchRepository.markDone(runId);
        return { ran: true as const, ok: true as const };
    },
    onFailure: async ({ payload, error }) => {
        logger.error("research failed after every attempt", { runId: payload.runId, error });
        await ResearchRepository.markFailed(payload.runId, config.jobs.SERVER_ERROR_MESSAGE).catch((writeError) => {
            logger.error("could not record the research failure", { runId: payload.runId, writeError });
        });
    },
});
