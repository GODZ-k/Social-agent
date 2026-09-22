import "server-only";
import { cache } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { Role, Viewer } from "@/lib/types";

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

/**
 * Admins are marked in Clerk: Users, pick the user, Metadata, Public, `{ "role": "admin" }`.
 * NEXT_PUBLIC_ADMIN_EMAILS is a shortcut for local development. The API checks the
 * role itself; this only decides what the web app shows and which mock rows it serves.
 */
function resolveRole(publicMetadata: unknown, email: string): Role {
  const role = (publicMetadata as { role?: unknown } | null)?.role;
  return role === "admin" || ADMIN_EMAILS.includes(email.toLowerCase()) ? "admin" : "client";
}

/**
 * The signed-in person. Resolved once per request (React.cache) and passed
 * down as props, never kept in module state. `proxy.ts` already sends
 * signed-out visitors to /sign-in, so the redirect here is a safety net.
 */
export const getViewer = cache(async (): Promise<Viewer> => {
  const user = await currentUser();
  if (!user) redirect("/sign-in");
  const email = user.primaryEmailAddress?.emailAddress ?? "";
  return {
    id: user.id,
    email,
    name: user.fullName ?? user.firstName ?? email,
    role: resolveRole(user.publicMetadata, email),
  };
});
