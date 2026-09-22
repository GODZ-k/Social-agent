import { brandScans, type BrandScanRow, type NewBrandScanRow } from "@social-agent/db";
import type { ScanPage, ScanResult, ScanStepId } from "@social-agent/shared";
import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "@/config/db";

/** Which scans a query may touch: all of them (admins) or one requester's. The service decides. */
export type ScanScope = "all" | { requestedBy: string };

const ACTIVE_STATUSES = ["queued", "running"] as const;
export const INTERRUPTED_MESSAGE = "The scan was interrupted. Please try again.";

const inScope = (scope: ScanScope) => (scope === "all" ? undefined : eq(brandScans.requestedBy, scope.requestedBy));
const byId = (id: string, scope: ScanScope) => and(eq(brandScans.id, id), inScope(scope));
const isActive = () => inArray(brandScans.status, [...ACTIVE_STATUSES]);

/** Database queries for the `brand_scans` table. No business rules here. */
export class ScansRepository {
    static async create(values: NewBrandScanRow): Promise<BrandScanRow> {
        const [row] = await db.insert(brandScans).values(values).returning();
        if (!row) throw new Error("Insert into brand_scans returned no row");
        return row;
    }

    static async findById(id: string, scope: ScanScope): Promise<BrandScanRow | undefined> {
        const [row] = await db.select().from(brandScans).where(byId(id, scope)).limit(1);
        return row;
    }

    /** The oldest scan this person still has queued or running, if any. */
    static async findActiveFor(requestedBy: string): Promise<BrandScanRow | undefined> {
        const [row] = await db
            .select()
            .from(brandScans)
            .where(and(eq(brandScans.requestedBy, requestedBy), isActive()))
            .orderBy(asc(brandScans.createdAt))
            .limit(1);
        return row;
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
        const rows = await db
            .update(brandScans)
            .set({ status: "failed", currentStep: null, error: INTERRUPTED_MESSAGE, finishedAt: new Date() })
            .where(isActive())
            .returning({ id: brandScans.id });
        return rows.length;
    }
}
