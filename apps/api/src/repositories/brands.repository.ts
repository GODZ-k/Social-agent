import { brands, type BrandRow, type NewBrandRow } from "@social-agent/db";
import type { Questionnaire, QuestionnaireSession } from "@social-agent/shared";
import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/config/db";
import { insertedRow } from "@/utils";
import type { BrandScope } from "@/types/scope";

/** Database queries for the `brands` table. No business rules here. */
export class BrandsRepository {
    static async list(scope: BrandScope): Promise<BrandRow[]> {
        const brandFilter = BrandsRepository.reachable(scope);
        return db.select().from(brands).where(brandFilter).orderBy(desc(brands.createdAt));
    }

    static async findById(id: string, scope: BrandScope): Promise<BrandRow | undefined> {
        const brandFilter = BrandsRepository.reachable(scope, id);
        return db.query.brands.findFirst({ where: brandFilter });
    }

    static async create(values: NewBrandRow): Promise<BrandRow> {
        const rows = await db.insert(brands).values(values).returning();
        return insertedRow(rows, "brands");
    }

    /** Returns undefined when the brand does not exist or is outside the scope. */
    static async update(id: string, scope: BrandScope, changes: Partial<NewBrandRow>): Promise<BrandRow | undefined> {
        const brandFilter = BrandsRepository.reachable(scope, id);
        const [row] = await db
            .update(brands)
            .set({ ...changes, updatedAt: new Date() })
            .where(brandFilter)
            .returning();
        return row;
    }

    /**
     * Approves a questionnaire nobody approved yet; of two approvals at once only one gets a row back.
     * The service already checked ownership.
     */
    static async approveQuestionnaire(id: string, questionnaire: Questionnaire): Promise<BrandRow | undefined> {
        const now = new Date();
        const brandFilter = and(eq(brands.id, id), isNull(brands.questionnaireApprovedAt));
        const [row] = await db
            .update(brands)
            .set({ questionnaire, questionnaireApprovedAt: now, updatedAt: now })
            .where(brandFilter)
            .returning();
        return row;
    }

    /**
     * Writes a session only while the stored one is still `expectedSessionId` (null: no session yet)
     * and the questionnaire is not approved, so a slow request never overwrites a newer session.
     * The service already checked ownership.
     */
    static async replaceQuestionnaireSession(
        id: string,
        expectedSessionId: string | null,
        changes: { questionnaireSession: QuestionnaireSession; preferences?: NewBrandRow["preferences"] },
    ): Promise<BrandRow | undefined> {
        const sameSession = expectedSessionId === null
            ? isNull(brands.questionnaireSession)
            : sql`${brands.questionnaireSession}->>'sessionId' = ${expectedSessionId}`;
        const brandFilter = and(eq(brands.id, id), isNull(brands.questionnaireApprovedAt), sameSession);
        const [row] = await db
            .update(brands)
            .set({ ...changes, updatedAt: new Date() })
            .where(brandFilter)
            .returning();
        return row;
    }

    /**
     * Brands are never deleted: posts, metrics and learnings hang off them.
     * Returns false when the brand does not exist, is outside the scope, or is already archived.
     */
    static async archive(id: string, scope: BrandScope): Promise<boolean> {
        const now = new Date();
        const brandFilter = BrandsRepository.reachable(scope, id);
        const archived = await db
            .update(brands)
            .set({ status: "archived", archivedAt: now, updatedAt: now })
            .where(brandFilter)
            .returning({ id: brands.id });
        return archived.length > 0;
    }

    /** The ownership rule: live brands the scope may reach, or only the one with `id`. Archived and other owners' brands are never touched. */
    private static reachable(scope: BrandScope, id?: string) {
        const owner = scope === "all" ? undefined : eq(brands.ownerId, scope.ownerId);
        const one = id === undefined ? undefined : eq(brands.id, id);
        return and(eq(brands.status, "active"), owner, one);
    }
}
