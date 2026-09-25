import { brands, users, type UserRow } from "@social-agent/db";
import { and, count, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/config/db";
import type { ClientWithBrandCount, UserProfile } from "@/types/user";

/** Database queries for the `users` table. No business rules here. */
export class UsersRepository {
    static async findByClerkId(clerkId: string): Promise<UserRow | undefined> {
        return db.query.users.findFirst({ where: eq(users.clerkId, clerkId) });
    }

    static async update(id: string, profile: Partial<UserProfile>): Promise<UserRow | undefined> {
        const [row] = await db
            .update(users)
            .set({ ...profile, updatedAt: new Date() })
            .where(eq(users.id, id))
            .returning();
        return row;
    }

    /** An admin created this row; nobody has signed in as it yet. */
    static async findInvitedByEmail(email: string): Promise<UserRow | undefined> {
        const userFilter = and(eq(users.email, email), eq(users.status, "invited"), isNull(users.clerkId));
        return db.query.users.findFirst({
            where: userFilter,
        });
    }

    /**
     * The invited person's first sign-in. The `clerk_id is null` guard makes a second,
     * simultaneous request a no-op instead of overwriting the link.
     */
    static async linkInvited(id: string, clerkId: string, profile: UserProfile): Promise<void> {
        const userFilter = and(eq(users.id, id), isNull(users.clerkId));
        await db
            .update(users)
            .set({ ...profile, clerkId, status: "active", updatedAt: new Date() })
            .where(userFilter);
    }

    /**
     * Two first requests from the same person can arrive together, and the email may already
     * belong to another row. Either conflict skips the insert, so read the row back afterwards.
     */
    static async createIfMissing(clerkId: string, profile: UserProfile): Promise<void> {
        await db
            .insert(users)
            .values({ clerkId, ...profile })
            .onConflictDoNothing();
    }

    static async findByEmail(email: string): Promise<UserRow | undefined> {
        return db.query.users.findFirst({ where: eq(users.email, email) });
    }

    /** Admins are not clients, so they are left out. */
    static async findClientById(id: string): Promise<UserRow | undefined> {
        const userFilter = and(eq(users.id, id), eq(users.role, "client"));
        return db.query.users.findFirst({ where: userFilter });
    }

    /** Every client, newest first, with how many live brands they own. */
    static async listClients(): Promise<ClientWithBrandCount[]> {
        const joinFilter = and(eq(brands.ownerId, users.id), isNull(brands.archivedAt));
        return db
            .select({ user: users, brandCount: count(brands.id) })
            .from(users)
            .leftJoin(brands, joinFilter)
            .where(eq(users.role, "client"))
            .groupBy(users.id)
            .orderBy(desc(users.createdAt));
    }

    /** Returns undefined when the email is already taken (a simultaneous invite). */
    static async createInvited(values: {
        email: string;
        name: string | null;
        phone: string | null;
        invitedBy: string;
    }): Promise<UserRow | undefined> {
        const [row] = await db
            .insert(users)
            .values({ ...values, role: "client", status: "invited" })
            .onConflictDoNothing()
            .returning();
        return row;
    }

    /** Undo for an invitation whose email could not be sent. Never touches a person who has signed in. */
    static async deleteInvited(id: string): Promise<void> {
        const userFilter = and(eq(users.id, id), eq(users.status, "invited"), isNull(users.clerkId));
        await db.delete(users).where(userFilter);
    }
}
