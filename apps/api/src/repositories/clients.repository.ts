import { clients, type ClientRow, type NewClientRow } from "@social-agent/db";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/config/db";

/**
 * Which clients a query may touch: all of them (admins) or one owner's.
 * The service decides the scope. Every query below puts it in the WHERE clause,
 * so a user can never read, change or delete a client that is not theirs.
 */
export type ClientScope = "all" | { ownerId: string };

const inScope = (scope: ClientScope) => (scope === "all" ? undefined : eq(clients.ownerId, scope.ownerId));

const byId = (id: string, scope: ClientScope) => and(eq(clients.id, id), inScope(scope));

/** Database queries for the `clients` table. No business rules here. */
export class ClientsRepository {
    static async list(scope: ClientScope): Promise<ClientRow[]> {
        return db.select().from(clients).where(inScope(scope)).orderBy(desc(clients.createdAt));
    }

    static async findById(id: string, scope: ClientScope): Promise<ClientRow | undefined> {
        const [row] = await db.select().from(clients).where(byId(id, scope)).limit(1);
        return row;
    }

    static async create(values: NewClientRow): Promise<ClientRow> {
        const [row] = await db.insert(clients).values(values).returning();
        if (!row) throw new Error("Insert into clients returned no row");
        return row;
    }

    /** Returns undefined when the client does not exist or is outside the scope. */
    static async update(id: string, scope: ClientScope, changes: Partial<NewClientRow>): Promise<ClientRow | undefined> {
        const [row] = await db
            .update(clients)
            .set({ ...changes, updatedAt: new Date() })
            .where(byId(id, scope))
            .returning();
        return row;
    }

    /** Returns false when the client does not exist or is outside the scope. */
    static async delete(id: string, scope: ClientScope): Promise<boolean> {
        const deleted = await db.delete(clients).where(byId(id, scope)).returning({ id: clients.id });
        return deleted.length > 0;
    }
}
