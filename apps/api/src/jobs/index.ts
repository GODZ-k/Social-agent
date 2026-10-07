import { config } from "@/config/constants";
import { ResearchRepository } from "@/repositories/research.repository";
import { ScansRepository } from "@/repositories/scans.repository";
import { businessDiscoveryTask } from "@/trigger/research.task";
import { brandScanTask } from "@/trigger/scan.task";

/**
 * The seam between the services and whatever runs background work.
 *
 * A service asks for a job to start and learns nothing about the runner. Trigger.dev is behind this
 * file today; it replaced an in-process FIFO queue, and the next change stays inside here.
 *
 * Unlike that queue, handing the job over is a network call, so these are awaited. If the handover
 * fails the row is marked failed at once: a row left `queued` with nothing running is invisible to
 * the client and to the admin, which is the failure mode the old queue had on every restart.
 */

export async function startScanJob(scanId: string): Promise<void> {
    try {
        await brandScanTask.trigger({ scanId });
    } catch (error) {
        console.error(`scan ${scanId} could not be handed to the runner`, error);
        await ScansRepository.markFailed(scanId, config.jobs.SERVER_ERROR_MESSAGE);
        throw error;
    }
}

export async function startResearchJob(runId: string): Promise<void> {
    try {
        await businessDiscoveryTask.trigger({ runId });
    } catch (error) {
        console.error(`research ${runId} could not be handed to the runner`, error);
        await ResearchRepository.markFailed(runId, config.jobs.SERVER_ERROR_MESSAGE);
        throw error;
    }
}
