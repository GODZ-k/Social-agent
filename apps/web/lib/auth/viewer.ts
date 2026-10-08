import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import type { Role } from "@social-agent/shared";
import type { Viewer } from "@/lib/types";
import { getSessionUser } from "./server";
import { routes } from "@/config/routes";

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

// Development only: lets admins in without two-factor while the Clerk dev instance has
// the authenticator app switched off. Never applies in production. Remove once TOTP works.
const SKIP_ADMIN_TWO_FACTOR = process.env.NODE_ENV !== "production" && process.env.AUTH_SKIP_ADMIN_2FA === "on";

/**
 * The role comes from the auth provider's user. NEXT_PUBLIC_ADMIN_EMAILS is a
 * shortcut for local development. The API checks the role itself; this only
 * decides what the web app shows and which mock rows it serves.
 */
function resolveRole(role: string | null, email: string): Role {
  return role === "admin" || ADMIN_EMAILS.includes(email.toLowerCase()) ? "admin" : "client";
}

/**
 * The signed-in person. Resolved once per request (React.cache) and passed
 * down as props, never kept in module state. `proxy.ts` already sends
 * signed-out visitors to /sign-in, so the redirect here is a safety net.
 * Admins open every client's brand, so nothing renders for one until two-factor is on.
 */
export const getViewer = cache(async (): Promise<Viewer> => {
  const user = await getSessionUser();
  if (!user) redirect(routes.auth.signIn);
  const role = resolveRole(user.role, user.email);
  if (role === "admin" && !user.twoFactorEnabled && !SKIP_ADMIN_TWO_FACTOR) redirect(routes.auth.twoFactorSetup);
  return { id: user.id, email: user.email, name: user.name, role };
});

/** The signed-in person's role without the two-factor gate, for the pages that set two-factor up. */
export const getViewerRole = cache(async (): Promise<Role | null> => {
  const user = await getSessionUser();
  return user ? resolveRole(user.role, user.email) : null;
});
