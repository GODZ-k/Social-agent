import "server-only";
import { cookies } from "next/headers";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import type { SessionUser } from "../types";

// Clerk's own cookies; clearing them makes the next request signed out at once
// instead of waiting for the short-lived session token to expire.
const SESSION_COOKIES = ["__session", "__client_uat"];

/** Admins are marked in Clerk: Users, pick the user, Metadata, Public, `{ "role": "admin" }`. */
function metadataRole(publicMetadata: unknown): string | null {
  const role = (publicMetadata as { role?: unknown } | null)?.role;
  return typeof role === "string" ? role : null;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const user = await currentUser();
  if (!user) return null;
  const email = user.primaryEmailAddress?.emailAddress ?? "";
  return {
    id: user.id,
    email,
    name: user.fullName ?? user.firstName ?? email,
    role: metadataRole(user.publicMetadata),
    twoFactorEnabled: user.twoFactorEnabled,
  };
}

/** Ends the current session on the server, so it stops working everywhere, not only in this tab. */
export async function endSession(): Promise<void> {
  const { sessionId } = await auth();
  if (sessionId) {
    const client = await clerkClient();
    await client.sessions.revokeSession(sessionId);
  }
  const jar = await cookies();
  for (const name of SESSION_COOKIES) jar.delete(name);
}

/** Clerk puts the invitation ticket in `__clerk_ticket`; our own links put it in the path. */
export function inviteTokenFrom({ path, search }: { path?: string; search: Record<string, string | string[] | undefined> }): string | null {
  const ticket = search.__clerk_ticket;
  if (typeof ticket === "string" && ticket) return ticket;
  return path ?? null;
}
