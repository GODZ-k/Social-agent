import type { ResearchRunRow } from "@social-agent/db";
import { config } from "@/config/constants";
import { runBusinessDiscovery } from "@/mastra/workflows/business-discovery/run";
import type { DiscoverySuccess } from "@/mastra/workflows/business-discovery/schemas";
import { ResearchRepository } from "@/repositories/research.repository";
import { createSerialQueue } from "@/utils/queue";

// One run at a time: a free Firecrawl key allows 10 requests a minute and a run makes up to 24.
// The queue lives in this process, like the scan queue; a Postgres-backed one can replace both.
const queue = createSerialQueue("research", runResearch);

export function enqueueResearch(id: string): void {
    queue.enqueue(id);
}

/** Runs not yet finished: the shutdown log prints it. */
export function pendingResearchCount(): number {
    return queue.pendingCount();
}

/** Claims a still-queued row for this run, or nothing if the start-up sweep got there first. */
async function claimQueued(id: string): Promise<ResearchRunRow | undefined> {
    const run = await ResearchRepository.findRunById(id);
    if (!run || run.status !== "queued") return undefined;

    await ResearchRepository.markRunning(id);
    return run;
}

/** The workflow returns the documents; the queue writes them, so the workflow stays free of the database. */
async function storeOutcome(brandId: string, outcome: DiscoverySuccess): Promise<void> {
    await ResearchRepository.insertResearch({ brandId, kind: "growth_brief", content: outcome.brief, sources: outcome.sources });
    await ResearchRepository.insertResearch({ brandId, kind: "audience_profile", content: outcome.profile, sources: outcome.sources });
}

async function runResearch(id: string): Promise<void> {
    try {
        const run = await claimQueued(id);
        if (!run) return;

        const outcome = await runBusinessDiscovery(run.brandId, { onStep: (step) => ResearchRepository.markStep(id, step) });
        if (!outcome.ok) {
            await ResearchRepository.markFailed(id, outcome.message);
            return;
        }

        await storeOutcome(run.brandId, outcome);
        await ResearchRepository.markDone(id);
    } catch (error) {
        console.error(`research ${id} failed`, error);
        await ResearchRepository.markFailed(id, config.jobs.SERVER_ERROR_MESSAGE).catch((writeError) => {
            console.error(`research ${id}: could not record the failure`, writeError);
        });
    }
}
