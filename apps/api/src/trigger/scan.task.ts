import { logger, task } from "@trigger.dev/sdk";
import type { BrandScanRow } from "@social-agent/db";
import { config } from "@/config/constants";
import { runBrandScan } from "@/mastra/workflows/brand-scan/run";
import { ScansRepository } from "@/repositories/scans.repository";
import { firecrawlLimit } from "@/trigger/limits";

export const SCAN_TASK_ID = "brand-scan";

/** Claims a still-queued row for this run, so a retry or a double trigger cannot scan twice. */
async function claimQueued(id: string): Promise<BrandScanRow | undefined> {
    const scan = await ScansRepository.findById(id, "all");
    if (!scan || scan.status !== "queued") return undefined;

    await ScansRepository.markRunning(id);
    return scan;
}

/**
 * Reads a website and proposes a brand kit.
 *
 * Postgres stays the record of truth, exactly as it was under the in-process queue: the row's
 * `status` and `current_step` are what both the client and the admin read, and this task writes
 * them. Trigger.dev owns only the running, the retrying and the backoff.
 *
 * The row is marked failed in `onFailure`, not in `run`: every attempt but the last is followed by
 * another, and flipping the row to `failed` in between would show the client a failure that is
 * about to be retried.
 */
export const brandScanTask = task({
    id: SCAN_TASK_ID,
    concurrency: firecrawlLimit,
    run: async ({ scanId }: { scanId: string }) => {
        const scan = await claimQueued(scanId);
        if (!scan) {
            logger.info("scan is not queued any more, nothing to do", { scanId });
            return { ran: false as const };
        }

        const outcome = await runBrandScan(scan.url, { onStep: (step) => ScansRepository.markStep(scanId, step) });

        // A scan that the workflow itself rejected (an unreadable site) is a finished scan, not a
        // failed attempt: retrying it would read the same site again and fail the same way.
        if (!outcome.ok) {
            await ScansRepository.markFailed(scanId, outcome.message);
            return { ran: true as const, ok: false as const };
        }

        await ScansRepository.markDone(scanId, outcome.result, outcome.pages);
        return { ran: true as const, ok: true as const };
    },
    onFailure: async ({ payload, error }) => {
        logger.error("scan failed after every attempt", { scanId: payload.scanId, error });
        await ScansRepository.markFailed(payload.scanId, config.jobs.SERVER_ERROR_MESSAGE).catch((writeError) => {
            logger.error("could not record the scan failure", { scanId: payload.scanId, writeError });
        });
    },
});
