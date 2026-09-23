import { brands, type BrandRow, type NewBrandRow } from "@social-agent/db";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/config/db";

/**
 * Which brands a query may touch: all of them (admins) or one owner's.
 * The service decides the scope. Every query below puts it in the WHERE clause,
 * so a user can never read, change or archive a brand that is not theirs.
 */
export type BrandScope = "all" | { ownerId: string };

const inScope = (scope: BrandScope) => (scope === "all" ? undefined : eq(brands.ownerId, scope.ownerId));

/** Archived brands are invisible to every query here. */
const live = (scope: BrandScope) => and(eq(brands.status, "active"), inScope(scope));

const byId = (id: string, scope: BrandScope) => and(eq(brands.id, id), live(scope));

/** Database queries for the `brands` table. No business rules here. */
export class BrandsRepository {
    static async list(scope: BrandScope): Promise<BrandRow[]> {
        return db.select().from(brands).where(live(scope)).orderBy(desc(brands.createdAt));
    }

    static async findById(id: string, scope: BrandScope): Promise<BrandRow | undefined> {
        const [row] = await db.select().from(brands).where(byId(id, scope)).limit(1);
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
            .where(byId(id, scope))
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
            .where(byId(id, scope))
            .returning({ id: brands.id });
        return archived.length > 0;
    }
}
