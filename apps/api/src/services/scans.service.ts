import type { BrandScanRow } from "@social-agent/db";
import type { NewScanInput, Scan } from "@social-agent/shared";
import { ScansRepository } from "@/repositories/scans.repository";
import type { ScanScope } from "@/types/scope";
import { enqueueScan } from "@/scan-queue";
import type { AuthUser } from "@/services/users.service";
import { AppError } from "@/utils/AppError";
import { isUuid } from "@/utils";

export class ScansService {
    /** Starts a scan, or returns the one this person already has running: a double click must not start two. */
    static async start(user: AuthUser, input: NewScanInput): Promise<{ scan: Scan; created: boolean }> {
        const active = await ScansRepository.findActiveFor(user.id);
        if (active) return { scan: toScan(active), created: false };

        const row = await ScansRepository.create({ url: input.url, requestedBy: user.id });
        enqueueScan(row.id);
        return { scan: toScan(row), created: true };
    }

    static async get(user: AuthUser, id: string): Promise<Scan> {
        const scan = await findScan(user, id);
        return toScan(scan);
    }

    /** A finished scan the caller may attach to a brand they are creating. */
    static async claim(user: AuthUser, id: string): Promise<BrandScanRow> {
        const scan = await findScan(user, id);
        if (scan.status !== "done") throw new AppError("This scan hasn't finished yet.", 409, "SCAN_NOT_DONE");
        return scan;
    }
}

async function findScan(user: AuthUser, id: string): Promise<BrandScanRow> {
    if (!isUuid(id)) throw scanNotFound();
    const row = await ScansRepository.findById(id, scopeFor(user));
    if (!row) throw scanNotFound();
    return row;
}

/** An admin reaches every scan; everyone else only the scans they requested. */
function scopeFor(user: AuthUser): ScanScope {
    return user.role === "admin" ? "all" : { requestedBy: user.id };
}

/** "Missing" and "not yours" get the same answer, so nobody can probe for ids. */
function scanNotFound() {
    return new AppError("This scan doesn't exist, or you don't have access to it.", 404, "SCAN_NOT_FOUND");
}

const isoOrNull = (date: Date | null) => (date ? date.toISOString() : null);

/** Database row to the `Scan` shape the web app expects. */
export function toScan(row: BrandScanRow): Scan {
    return {
        id: row.id,
        brandId: row.brandId,
        url: row.url,
        status: row.status,
        currentStep: row.currentStep,
        pages: row.pages,
        result: row.result ?? null,
        error: row.error,
        startedAt: isoOrNull(row.startedAt),
        finishedAt: isoOrNull(row.finishedAt),
        createdAt: row.createdAt.toISOString(),
    };
}
