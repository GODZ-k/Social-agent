import type { BrandScanRow } from "@social-agent/db";
import { config } from "@/config/constants";
import { runBrandScan } from "@/mastra/workflows/brand-scan/run";
import { ScansRepository } from "@/repositories/scans.repository";
import { createSerialQueue } from "@/utils/queue";

// The queue lives in this process; a Postgres-backed one can replace it when there are several.
const queue = createSerialQueue("scan", runScan);

export function enqueueScan(id: string): void {
    queue.enqueue(id);
}

/** Scans not yet finished: the shutdown log prints it. */
export function pendingScanCount(): number {
    return queue.pendingCount();
}

/** Claims a still-queued row for this run, or nothing if the start-up sweep got there first. */
async function claimQueued(id: string): Promise<BrandScanRow | undefined> {
    const scan = await ScansRepository.findById(id, "all");
    if (!scan || scan.status !== "queued") return undefined;

    await ScansRepository.markRunning(id);
    return scan;
}

async function runScan(id: string): Promise<void> {
    try {
        const scan = await claimQueued(id);
        if (!scan) return;

        const outcome = await runBrandScan(scan.url, { onStep: (step) => ScansRepository.markStep(id, step) });
        if (outcome.ok) await ScansRepository.markDone(id, outcome.result, outcome.pages);
        else await ScansRepository.markFailed(id, outcome.message);
    } catch (error) {
        console.error(`scan ${id} failed`, error);
        await ScansRepository.markFailed(id, config.jobs.SERVER_ERROR_MESSAGE).catch((writeError) => {
            console.error(`scan ${id}: could not record the failure`, writeError);
        });
    }
}
