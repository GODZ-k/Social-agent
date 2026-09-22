import { clerkClient, clerkMiddleware, getAuth } from "@clerk/express";
import type { Request } from "express";
import { env } from "@/config/env";

// The only file that talks to Clerk. When Clerk is replaced by our own auth, this is the file that changes.

// In production a session must have been issued to one of our own web origins (the token's `azp` claim).
// In development the check is off, so tokens minted with the Clerk Backend API (`scripts/dev-token.ts`) work too.
const authorizedParties = env.NODE_ENV === "production" ? env.CORS_ORIGINS : undefined;

export const clerkAuth = clerkMiddleware({ authorizedParties });

// The signed-in Clerk user id, or null for an anonymous request. 
export function getClerkUserId(req: Request): string | null {
    return getAuth(req).userId ?? null;
}

export interface ClerkUser {
    email: string;
    name: string | null;
    imageUrl: string | null;
    emailVerified: boolean;
    metadataRole: unknown;
}

export async function fetchClerkUser(clerkId: string): Promise<ClerkUser> {
    const user = await clerkClient.users.getUser(clerkId);
    const primaryEmail = user.primaryEmailAddress;

    const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");

    return {
        email: primaryEmail?.emailAddress ?? "",
        name: fullName || null,
        imageUrl: user.imageUrl || null,
        emailVerified: primaryEmail?.verification?.status === "verified",
        metadataRole: user.publicMetadata.role,
    };
}

/**
 * Clerk emails the person a sign-up link. `ignoreExisting` keeps this from failing when they were
 * invited before or already have a Clerk account; either way they end up signing in with this email.
 */
export async function sendInvitation(email: string, redirectUrl: string): Promise<void> {
    await clerkClient.invitations.createInvitation({ emailAddress: email, redirectUrl, ignoreExisting: true });
}
