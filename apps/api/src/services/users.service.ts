import type { UserRow } from "@social-agent/db";
import type { Role } from "@social-agent/shared";
import { fetchClerkUser, type ClerkUser } from "@/auth/clerk";
import { env } from "@/config/env";
import { UsersRepository, type UserProfile } from "@/repositories/users.repository";
import { AppError } from "@/utils/AppError";
import { isUniqueViolation } from "@/utils";
import { config } from "@/config/constants";

/** The signed-in user, as the rest of the API sees them. `id` is our own id, not Clerk's. */
export interface AuthUser {
    id: string;
    clerkId: string | null;
    email: string;
    name: string | null;
    imageUrl: string | null;
    role: Role;
    createdAt: Date;
}

/** How long our copy of a Clerk user is trusted before we ask Clerk again. */
const ONE_HOUR_MS = config.time.ONE_HOUR_MS;

export class UsersService {
    static async findOrCreate(clerkId: string): Promise<AuthUser> {
        const existing = await UsersRepository.findByClerkId(clerkId);

        const isFresh = existing && Date.now() - existing.updatedAt.getTime() < ONE_HOUR_MS;
        if (isFresh) return toAuthUser(existing);

        const clerkUser = await fetchClerkUser(clerkId);

        // Our rows are keyed by email (invitations link by it), so an account without one cannot be stored.
        if (!clerkUser.email) throw new AppError("Your account has no email address. Add one, then try again.", 403, "EMAIL_REQUIRED");

        const profile = {
            // `users.email` is always lowercase; the database rejects anything else.
            email: clerkUser.email.toLowerCase(),
            name: clerkUser.name,
            imageUrl: clerkUser.imageUrl,
            role: roleFor(clerkUser),
        };

        if (existing) {
            const updated = await refresh(existing.id, profile);
            return toAuthUser(updated ?? existing);
        }

        // First sign-in. If an admin invited this person, the row already exists (and may already
        // own brands): attach the Clerk account to it. Only a verified email proves it is them.
        if (clerkUser.emailVerified) {
            const invited = await UsersRepository.findInvitedByEmail(profile.email);
            if (invited) {
                const name = profile.name ?? invited.name;
                await UsersRepository.linkInvited(invited.id, clerkId, { ...profile, name });
            }
        }

        // A no-op when the link above (or a simultaneous request) already produced the row.
        await UsersRepository.createIfMissing(clerkId, profile);

        const created = await UsersRepository.findByClerkId(clerkId);
        if (!created) {
            // The email is taken by a row this Clerk account may not claim: an invitation waiting
            // for a verified email, or another account.
            throw new AppError(
                "This email already belongs to another account. Verify your email address, then try again.",
                409,
                "EMAIL_IN_USE",
            );
        }
        return toAuthUser(created);
    }
}

/**
 * Copies Clerk's profile into our row. If Clerk's email now belongs to another row of ours
 * (for example an invitation waiting for that address), keep our old email and refresh the rest.
 * Letting the error escape would answer 500 on every request this person makes, forever,
 * because `updated_at` would never advance.
 */
async function refresh(id: string, profile: UserProfile): Promise<UserRow | undefined> {
    try {
        return await UsersRepository.update(id, profile);
    } catch (error) {
        if (!isUniqueViolation(error)) throw error;

        console.warn(`User ${id}: Clerk email is already used by another row; kept the stored email.`);
        const { email: _email, ...rest } = profile;
        return UsersRepository.update(id, rest);
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
    return {
        id: row.id,
        clerkId: row.clerkId,
        email: row.email,
        name: row.name,
        imageUrl: row.imageUrl,
        role: row.role,
        createdAt: row.createdAt,
    };
}
