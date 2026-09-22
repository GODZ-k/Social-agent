import { brands, users, type UserRow } from "@social-agent/db";
import { and, count, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/config/db";

/** The fields we copy from Clerk. */
export type UserProfile = Pick<UserRow, "email" | "name" | "imageUrl" | "role">;

export interface ClientWithBrandCount {
    user: UserRow;
    brandCount: number;
}

/** Database queries for the `users` table. No business rules here. */
export class UsersRepository {
    static async findByClerkId(clerkId: string): Promise<UserRow | undefined> {
        const [row] = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
        return row;
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
        const [row] = await db
            .select()
            .from(users)
            .where(and(eq(users.email, email), eq(users.status, "invited"), isNull(users.clerkId)))
            .limit(1);
        return row;
    }

    /**
     * The invited person's first sign-in. The `clerk_id is null` guard makes a second,
     * simultaneous request a no-op instead of overwriting the link.
     */
    static async linkInvited(id: string, clerkId: string, profile: UserProfile): Promise<void> {
        await db
            .update(users)
            .set({ ...profile, clerkId, status: "active", updatedAt: new Date() })
            .where(and(eq(users.id, id), isNull(users.clerkId)));
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
        const [row] = await db.select().from(users).where(eq(users.email, email)).limit(1);
        return row;
    }

    /** Admins are not clients, so they are left out. */
    static async findClientById(id: string): Promise<UserRow | undefined> {
        const [row] = await db
            .select()
            .from(users)
            .where(and(eq(users.id, id), eq(users.role, "client")))
            .limit(1);
        return row;
    }

    /** Every client, newest first, with how many live brands they own. */
    static async listClients(): Promise<ClientWithBrandCount[]> {
        return db
            .select({ user: users, brandCount: count(brands.id) })
            .from(users)
            .leftJoin(brands, and(eq(brands.ownerId, users.id), isNull(brands.archivedAt)))
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
        await db.delete(users).where(and(eq(users.id, id), eq(users.status, "invited"), isNull(users.clerkId)));
    }
}
