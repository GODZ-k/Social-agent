import { brandScans, type BrandScanRow, type NewBrandScanRow } from "@social-agent/db";
import type { ScanPage, ScanResult, ScanStepId } from "@social-agent/shared";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { config } from "@/config/constants";
import { db } from "@/config/db";
import { insertedRow } from "@/utils";
import type { ScanScope } from "@/types/scope";

/** Database queries for the `brand_scans` table. No business rules here. */
export class ScansRepository {
    static async create(values: NewBrandScanRow): Promise<BrandScanRow> {
        const rows = await db.insert(brandScans).values(values).returning();
        return insertedRow(rows, "brand_scans");
    }

    static async findById(id: string, scope: ScanScope): Promise<BrandScanRow | undefined> {
        const scanFilter = ScansRepository.byId(id, scope);
        return db.query.brandScans.findFirst({ where: scanFilter });
    }

    /** The oldest scan this person still has queued or running, if any. */
    static async findActiveFor(requestedBy: string): Promise<BrandScanRow | undefined> {
        const active = ScansRepository.isActive();
        const scanFilter = and(eq(brandScans.requestedBy, requestedBy), active);
        return db.query.brandScans.findFirst({
            where: scanFilter,
            orderBy: asc(brandScans.createdAt),
        });
    }

    /** The newest finished scan linked to a brand: business discovery reads its result as site facts. */
    static async findLatestDoneForBrand(brandId: string): Promise<BrandScanRow | undefined> {
        const scanFilter = and(eq(brandScans.brandId, brandId), eq(brandScans.status, "done"));
        return db.query.brandScans.findFirst({
            where: scanFilter,
            orderBy: desc(brandScans.createdAt),
        });
    }

    static async markRunning(id: string): Promise<void> {
        await db.update(brandScans).set({ status: "running", startedAt: new Date(), currentStep: null }).where(eq(brandScans.id, id));
    }

    static async markStep(id: string, step: ScanStepId): Promise<void> {
        await db.update(brandScans).set({ currentStep: step }).where(eq(brandScans.id, id));
    }

    static async markDone(id: string, result: ScanResult, pages: ScanPage[]): Promise<void> {
        await db
            .update(brandScans)
            .set({ status: "done", currentStep: null, result, pages, finishedAt: new Date() })
            .where(eq(brandScans.id, id));
    }

    static async markFailed(id: string, error: string): Promise<void> {
        await db
            .update(brandScans)
            .set({ status: "failed", currentStep: null, error, finishedAt: new Date() })
            .where(eq(brandScans.id, id));
    }

    static async attachBrand(id: string, brandId: string): Promise<void> {
        await db.update(brandScans).set({ brandId }).where(eq(brandScans.id, id));
    }

    /** Scans a previous process left behind can never finish: fail them. Returns how many. */
    static async failInterrupted(): Promise<number> {
        const scanFilter = ScansRepository.isActive();
        const rows = await db
            .update(brandScans)
            .set({ status: "failed", currentStep: null, error: config.scan.INTERRUPTED_MESSAGE, finishedAt: new Date() })
            .where(scanFilter)
            .returning({ id: brandScans.id });
        return rows.length;
    }

    private static byId(id: string, scope: ScanScope) {
        const requester = scope === "all" ? undefined : eq(brandScans.requestedBy, scope.requestedBy);
        return and(eq(brandScans.id, id), requester);
    }

    private static isActive() {
        return inArray(brandScans.status, [...config.scan.ACTIVE_STATUSES]);
    }
}
