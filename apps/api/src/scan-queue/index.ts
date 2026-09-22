import type { BrandScanRow } from "@social-agent/db";
import { runBrandScan } from "@/mastra/workflows/brand-scan/run";
import { ScansRepository } from "@/repositories/scans.repository";

// One scan at a time: a free Firecrawl key allows 10 requests a minute and a scan is up to 7.
// The queue lives in this process; a Postgres-backed one can replace it when there are several.
const SCAN_CONCURRENCY = 1;
const SERVER_ERROR_MESSAGE = "Something went wrong on our side. Please try again.";

const waiting: string[] = [];
let running = 0;

export function enqueueScan(id: string): void {
    waiting.push(id);
    startNext();
}

/** Scans not yet finished: the shutdown log prints it. */
export function pendingScanCount(): number {
    return waiting.length + running;
}

function startNext(): void {
    while (running < SCAN_CONCURRENCY && waiting.length > 0) {
        const id = waiting.shift()!;
        running += 1;
        void runScan(id)
            .catch((error) => console.error(`scan ${id} could not be run`, error))
            .finally(() => {
                running -= 1;
                startNext();
            });
    }
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
        await ScansRepository.markFailed(id, SERVER_ERROR_MESSAGE).catch((writeError) => {
            console.error(`scan ${id}: could not record the failure`, writeError);
        });
    }
}
