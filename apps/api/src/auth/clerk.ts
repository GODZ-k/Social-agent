import { clerkClient, clerkMiddleware, getAuth } from "@clerk/express";
import type { Request } from "express";
import { env } from "@/config/env";

// The only file that talks to Clerk. When Clerk is replaced by our own auth, this is the file that changes.

export const clerkAuth = clerkMiddleware({ authorizedParties: env.CORS_ORIGINS });

// The signed-in Clerk user id, or null for an anonymous request. 
export function getClerkUserId(req: Request): string | null {
    return getAuth(req).userId ?? null;
}

export interface ClerkUser {
    email: string;
    emailVerified: boolean;
    metadataRole: unknown;
}

export async function fetchClerkUser(clerkId: string): Promise<ClerkUser> {
    const user = await clerkClient.users.getUser(clerkId);
    const primaryEmail = user.primaryEmailAddress;

    return {
        email: primaryEmail?.emailAddress ?? "",
        emailVerified: primaryEmail?.verification?.status === "verified",
        metadataRole: user.publicMetadata.role,
    };
}
