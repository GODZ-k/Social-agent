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

/**
 * Database queries for `research_runs` and `brand_research`. No business rules here. Access is
 * decided per brand by the service (`BrandsService.get` applies the ownership rule first), so
 * these queries take a brand id, not a scope.
 */
export class ResearchRepository {
    static async createRun(values: NewResearchRunRow): Promise<ResearchRunRow> {
        const [row] = await db.insert(researchRuns).values(values).returning();
        if (!row) throw new Error("Insert into research_runs returned no row");
        return row;
    }

    static async findRunById(id: string): Promise<ResearchRunRow | undefined> {
        const [row] = await db.select().from(researchRuns).where(eq(researchRuns.id, id)).limit(1);
        return row;
    }

    /** The oldest run this brand still has queued or running, if any. */
    static async findActiveRunFor(brandId: string): Promise<ResearchRunRow | undefined> {
        const [row] = await db
            .select()
            .from(researchRuns)
            .where(and(eq(researchRuns.brandId, brandId), ResearchRepository.isActive()))
            .orderBy(asc(researchRuns.createdAt))
            .limit(1);
        return row;
    }

    /** The newest run for this brand, whatever its status. Undefined when research never ran. */
    static async findLatestRunFor(brandId: string): Promise<ResearchRunRow | undefined> {
        const [row] = await db
            .select()
            .from(researchRuns)
            .where(eq(researchRuns.brandId, brandId))
            .orderBy(desc(researchRuns.createdAt))
            .limit(1);
        return row;
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
        const rows = await db
            .update(researchRuns)
            .set({ status: "failed", currentStep: null, error: config.research.INTERRUPTED_MESSAGE, finishedAt: new Date() })
            .where(ResearchRepository.isActive())
            .returning({ id: researchRuns.id });
        return rows.length;
    }

    /** The newest version of one kind for this brand, if any. */
    static async latestResearch(brandId: string, kind: ResearchKind): Promise<BrandResearchRow | undefined> {
        const [row] = await db
            .select()
            .from(brandResearch)
            .where(ResearchRepository.ofKind(brandId, kind))
            .orderBy(desc(brandResearch.version))
            .limit(1);
        return row;
    }

    /**
     * Writes the next version: `max(version) + 1` read and inserted in one transaction. Two runs
     * racing for the same number would also hit the unique index, so a version is never reused.
     */
    static async insertResearch(values: Omit<NewBrandResearchRow, "version">): Promise<BrandResearchRow> {
        return db.transaction(async (tx) => {
            const [latest] = await tx
                .select({ version: max(brandResearch.version) })
                .from(brandResearch)
                .where(ResearchRepository.ofKind(values.brandId, values.kind));
            const version = (latest?.version ?? 0) + 1;

            const [row] = await tx.insert(brandResearch).values({ ...values, version }).returning();
            if (!row) throw new Error("Insert into brand_research returned no row");
            return row;
        });
    }

    private static isActive() {
        return inArray(researchRuns.status, [...config.research.ACTIVE_STATUSES]);
    }

    private static ofKind(brandId: string, kind: ResearchKind) {
        return and(eq(brandResearch.brandId, brandId), eq(brandResearch.kind, kind));
    }
}
