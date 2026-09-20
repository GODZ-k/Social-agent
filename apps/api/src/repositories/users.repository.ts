import { users, type UserRow } from "@social-agent/db";
import { eq } from "drizzle-orm";
import { db } from "@/config/db";

type UserProfile = Pick<UserRow, "email" | "role">;

/** Database queries for the `users` table. No business rules here. */
export class UsersRepository {
    static async findByClerkId(clerkId: string): Promise<UserRow | undefined> {
        const [row] = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
        return row;
    }

    /**
     * Two first requests from the same person can arrive together. The second
     * insert is skipped instead of failing, so read the row back afterwards.
     */
    static async createIfMissing(clerkId: string, profile: UserProfile): Promise<void> {
        await db
            .insert(users)
            .values({ clerkId, ...profile })
            .onConflictDoNothing({ target: users.clerkId });
    }

    static async update(id: string, profile: UserProfile): Promise<UserRow | undefined> {
        const [row] = await db
            .update(users)
            .set({ ...profile, updatedAt: new Date() })
            .where(eq(users.id, id))
            .returning();
        return row;
    }
}
