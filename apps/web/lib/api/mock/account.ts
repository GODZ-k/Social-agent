import "server-only";
import type { AccountDetails, AccountView, DeviceSession, Viewer } from "@/lib/types";

/**
 * The signed-in person's own account: details, password age and open sessions.
 * Name and email come from the viewer (Clerk); the rest has no real source yet,
 * so it lives here as a small mock store, same pattern as the other mock files.
 */

let detailsOverride: AccountDetails | null = null;
const passwordChangedAt = "2026-09-12T10:00:00.000Z";

let sessions: DeviceSession[] = [
  { id: "s1", device: "MacBook Pro", browser: "Safari", location: "San Francisco", lastActiveAt: new Date().toISOString(), current: true },
  { id: "s2", device: "iPhone", browser: "Safari", location: "San Francisco", lastActiveAt: new Date(Date.now() - 2 * 3600_000).toISOString(), current: false },
  { id: "s3", device: "Windows PC", browser: "Chrome", location: "Oakland", lastActiveAt: "2026-09-12T09:00:00.000Z", current: false },
];

export function accountOf(viewer: Viewer): AccountView {
  const details = detailsOverride ?? { name: viewer.name, email: viewer.email };
  return { details, passwordChangedAt, sessions };
}

export function saveDetails(details: AccountDetails): AccountDetails {
  detailsOverride = details;
  return details;
}

/** Every session but the current one signs out at once. */
export function signOutOthers(): DeviceSession[] {
  sessions = sessions.filter((s) => s.current);
  return sessions;
}
