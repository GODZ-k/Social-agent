/**
 * Who is making API calls. Filled in by <SessionGate> from Clerk.
 *
 * - The real API never trusts this: it verifies the bearer token itself and
 *   derives the user and role on the server. `getAuthToken` is what `http()`
 *   sends.
 * - The in-browser mock has no server, so it reads `getViewer()` to apply the
 *   same rules the API will: admins see every client, everyone else sees only
 *   the clients they own.
 */
export type Role = "admin" | "client";

export interface Viewer {
  id: string;
  role: Role;
  name: string;
  email: string;
}

let viewer: Viewer | null = null;
let tokenGetter: (() => Promise<string | null>) | null = null;

export function setSession(next: Viewer | null, getToken: (() => Promise<string | null>) | null) {
  viewer = next;
  tokenGetter = getToken;
}

export const getViewer = () => viewer;
export const getAuthToken = () => tokenGetter?.() ?? Promise.resolve(null);

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

/**
 * Admins are marked in Clerk: Users, pick the user, Metadata, Public, `{ "role": "admin" }`.
 * NEXT_PUBLIC_ADMIN_EMAILS is a shortcut for local development. Either way this only
 * decides what the UI shows; the API has to check the role itself.
 */
export function resolveRole(publicMetadata: unknown, email: string): Role {
  const role = (publicMetadata as { role?: unknown } | null)?.role;
  return role === "admin" || ADMIN_EMAILS.includes(email.toLowerCase()) ? "admin" : "client";
}
