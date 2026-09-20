import type { UserRow } from "@social-agent/db";
import { fetchClerkUser, type ClerkUser } from "@/auth/clerk";
import { env } from "@/config/env";
import { UsersRepository } from "@/repositories/users.repository";

export type Role = "admin" | "client";

/** The signed-in user, as the rest of the API sees them. `id` is our own id, not Clerk's. */
export interface AuthUser {
    id: string;
    clerkId: string;
    email: string;
    role: Role;
}

/** How long our copy of a Clerk user is trusted before we ask Clerk again. */
const ONE_HOUR_MS = 60 * 60 * 1000;

export class UsersService {
    static async findOrCreate(clerkId: string): Promise<AuthUser> {
        const existing = await UsersRepository.findByClerkId(clerkId);

        const isFresh = existing && Date.now() - existing.updatedAt.getTime() < ONE_HOUR_MS;
        if (isFresh) return toAuthUser(existing);

        const clerkUser = await fetchClerkUser(clerkId);
        const profile = { email: clerkUser.email, role: roleFor(clerkUser) };

        if (existing) {
            const updated = await UsersRepository.update(existing.id, profile);
            return toAuthUser(updated ?? existing);
        }

        await UsersRepository.createIfMissing(clerkId, profile);
        const created = await UsersRepository.findByClerkId(clerkId);
        if (!created) throw new Error(`User row for ${clerkId} is missing right after insert`);
        return toAuthUser(created);
    }
}

/**
 * Admin when Clerk says so (`publicMetadata.role` is "admin"), or when their
 * verified email is listed in ADMIN_EMAILS. Everyone else is a client.
 */
function roleFor(clerkUser: ClerkUser): Role {
    if (clerkUser.metadataRole === "admin") return "admin";

    const email = clerkUser.email.toLowerCase();
    const isListedAdmin = env.ADMIN_EMAILS.some((adminEmail) => adminEmail.toLowerCase() === email);
    if (clerkUser.emailVerified && isListedAdmin) return "admin";

    return "client";
}

function toAuthUser(row: UserRow): AuthUser {
    return { id: row.id, clerkId: row.clerkId, email: row.email, role: row.role };
}
