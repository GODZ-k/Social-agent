import { brands, type BrandRow, type NewBrandRow } from "@social-agent/db";
import type { Intake, IntakeSession } from "@social-agent/shared";
import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/config/db";
import type { BrandScope } from "@/types/scope";

/** Database queries for the `brands` table. No business rules here. */
export class BrandsRepository {
    static async list(scope: BrandScope): Promise<BrandRow[]> {
        return db.select().from(brands).where(BrandsRepository.live(scope)).orderBy(desc(brands.createdAt));
    }

    static async findById(id: string, scope: BrandScope): Promise<BrandRow | undefined> {
        const [row] = await db.select().from(brands).where(BrandsRepository.byId(id, scope)).limit(1);
        return row;
    }

    static async create(values: NewBrandRow): Promise<BrandRow> {
        const [row] = await db.insert(brands).values(values).returning();
        if (!row) throw new Error("Insert into brands returned no row");
        return row;
    }

    /** Returns undefined when the brand does not exist or is outside the scope. */
    static async update(id: string, scope: BrandScope, changes: Partial<NewBrandRow>): Promise<BrandRow | undefined> {
        const [row] = await db
            .update(brands)
            .set({ ...changes, updatedAt: new Date() })
            .where(BrandsRepository.byId(id, scope))
            .returning();
        return row;
    }

    /** Approves an intake nobody approved yet. Of two approvals at once only one gets a row back. */
    static async approveIntake(id: string, scope: BrandScope, intake: Intake): Promise<BrandRow | undefined> {
        const now = new Date();
        const [row] = await db
            .update(brands)
            .set({ intake, intakeApprovedAt: now, updatedAt: now })
            .where(and(BrandsRepository.byId(id, scope), isNull(brands.intakeApprovedAt)))
            .returning();
        return row;
    }

    /**
     * Writes a session only while the stored one is still `expectedSessionId` (null: no session yet)
     * and the intake is not approved, so a slow request never overwrites a newer session.
     */
    static async replaceIntakeSession(
        id: string,
        scope: BrandScope,
        expectedSessionId: string | null,
        changes: { intakeSession: IntakeSession; preferences?: NewBrandRow["preferences"] },
    ): Promise<BrandRow | undefined> {
        const sameSession = expectedSessionId === null
            ? isNull(brands.intakeSession)
            : sql`${brands.intakeSession}->>'sessionId' = ${expectedSessionId}`;
        const [row] = await db
            .update(brands)
            .set({ ...changes, updatedAt: new Date() })
            .where(and(BrandsRepository.byId(id, scope), isNull(brands.intakeApprovedAt), sameSession))
            .returning();
        return row;
    }

    /**
     * Brands are never deleted: posts, metrics and learnings hang off them.
     * Returns false when the brand does not exist, is outside the scope, or is already archived.
     */
    static async archive(id: string, scope: BrandScope): Promise<boolean> {
        const now = new Date();
        const archived = await db
            .update(brands)
            .set({ status: "archived", archivedAt: now, updatedAt: now })
            .where(BrandsRepository.byId(id, scope))
            .returning({ id: brands.id });
        return archived.length > 0;
    }

    /** Every query filters through here, so archived brands and other owners' brands are never touched. */
    private static live(scope: BrandScope) {
        const owner = scope === "all" ? undefined : eq(brands.ownerId, scope.ownerId);
        return and(eq(brands.status, "active"), owner);
    }

    private static byId(id: string, scope: BrandScope) {
        return and(eq(brands.id, id), BrandsRepository.live(scope));
    }
}
