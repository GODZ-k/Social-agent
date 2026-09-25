import {
    brandResearch,
    researchRuns,
    type BrandResearchRow,
    type NewBrandResearchRow,
    type NewResearchRunRow,
    type ResearchRunRow,
} from "@social-agent/db";
import type { ResearchKind, ResearchStepId } from "@social-agent/shared";
import { and, asc, desc, eq, inArray, max } from "drizzle-orm";
import { config } from "@/config/constants";
import { db } from "@/config/db";
import { insertedRow } from "@/utils";

/**
 * Database queries for `research_runs` and `brand_research`. No business rules here. Access is
 * decided per brand by the service (`BrandsService.findRow` applies the ownership rule first), so
 * these queries take a brand id, not a scope.
 */
export class ResearchRepository {
    static async createRun(values: NewResearchRunRow): Promise<ResearchRunRow> {
        const rows = await db.insert(researchRuns).values(values).returning();
        return insertedRow(rows, "research_runs");
    }

    static async findRunById(id: string): Promise<ResearchRunRow | undefined> {
        return db.query.researchRuns.findFirst({ where: eq(researchRuns.id, id) });
    }

    /** The oldest run this brand still has queued or running, if any. */
    static async findActiveRunFor(brandId: string): Promise<ResearchRunRow | undefined> {
        const active = ResearchRepository.isActive();
        const runFilter = and(eq(researchRuns.brandId, brandId), active);
        return db.query.researchRuns.findFirst({
            where: runFilter,
            orderBy: asc(researchRuns.createdAt),
        });
    }

    /** The newest run for this brand, whatever its status. Undefined when research never ran. */
    static async findLatestRunFor(brandId: string): Promise<ResearchRunRow | undefined> {
        return db.query.researchRuns.findFirst({
            where: eq(researchRuns.brandId, brandId),
            orderBy: desc(researchRuns.createdAt),
        });
    }

    static async markRunning(id: string): Promise<void> {
        await db.update(researchRuns).set({ status: "running", startedAt: new Date(), currentStep: null }).where(eq(researchRuns.id, id));
    }

    static async markStep(id: string, step: ResearchStepId): Promise<void> {
        await db.update(researchRuns).set({ currentStep: step }).where(eq(researchRuns.id, id));
    }

    static async markDone(id: string): Promise<void> {
        await db
            .update(researchRuns)
            .set({ status: "done", currentStep: null, finishedAt: new Date() })
            .where(eq(researchRuns.id, id));
    }

    static async markFailed(id: string, error: string): Promise<void> {
        await db
            .update(researchRuns)
            .set({ status: "failed", currentStep: null, error, finishedAt: new Date() })
            .where(eq(researchRuns.id, id));
    }

    /** Runs a previous process left behind can never finish: fail them. Returns how many. */
    static async failInterrupted(): Promise<number> {
        const runFilter = ResearchRepository.isActive();
        const rows = await db
            .update(researchRuns)
            .set({ status: "failed", currentStep: null, error: config.research.INTERRUPTED_MESSAGE, finishedAt: new Date() })
            .where(runFilter)
            .returning({ id: researchRuns.id });
        return rows.length;
    }

    /** The newest version of one kind for this brand, if any. */
    static async latestResearch(brandId: string, kind: ResearchKind): Promise<BrandResearchRow | undefined> {
        const researchFilter = ResearchRepository.ofKind(brandId, kind);
        return db.query.brandResearch.findFirst({
            where: researchFilter,
            orderBy: desc(brandResearch.version),
        });
    }

    /**
     * Writes the next version: `max(version) + 1` read and inserted in one transaction. Two runs
     * racing for the same number would also hit the unique index, so a version is never reused.
     */
    static async insertResearch(values: Omit<NewBrandResearchRow, "version">): Promise<BrandResearchRow> {
        return db.transaction(async (tx) => {
            const researchFilter = ResearchRepository.ofKind(values.brandId, values.kind);
            const [latest] = await tx
                .select({ version: max(brandResearch.version) })
                .from(brandResearch)
                .where(researchFilter);
            const version = (latest?.version ?? 0) + 1;

            const rows = await tx.insert(brandResearch).values({ ...values, version }).returning();
            return insertedRow(rows, "brand_research");
        });
    }

    private static isActive() {
        return inArray(researchRuns.status, [...config.research.ACTIVE_STATUSES]);
    }

    private static ofKind(brandId: string, kind: ResearchKind) {
        return and(eq(brandResearch.brandId, brandId), eq(brandResearch.kind, kind));
    }
}
