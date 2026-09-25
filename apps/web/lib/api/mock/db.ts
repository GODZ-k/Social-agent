import "server-only";
import { buildSeed, type SeedData } from "./seed";

/**
 * The server-side stand-in for the real API's database.
 *
 * It lives on `globalThis` so it survives hot reloads in development and is
 * shared by every request in the process. Nothing here is request-scoped:
 * access rules are applied by `lib/api/server.ts` and `lib/api/actions.ts`
 * using the signed-in viewer, never stored here.
 */
declare global {
  var __cadenceMockDb: SeedData | undefined;
}

export function getDb(): SeedData {
  if (!globalThis.__cadenceMockDb) {
    const seed = buildSeed();
    globalThis.__cadenceMockDb = recounted(seed);
  }
  return globalThis.__cadenceMockDb;
}

/** Headline counts are derived from the posts so lists and badges always agree. */
export function recounted(db: SeedData): SeedData {
  for (const client of db.clients) {
    const own = db.posts.filter((p) => p.clientId === client.id);
    client.stats.pendingApprovals = own.filter((p) => p.status === "in_review").length;
    client.stats.scheduled = own.filter((p) => p.status === "scheduled").length;
  }
  return db;
}

export function removeClient(id: string) {
  const db = getDb();
  db.clients = db.clients.filter((c) => c.id !== id);
  db.strategies = db.strategies.filter((s) => s.clientId !== id);
  db.posts = db.posts.filter((p) => p.clientId !== id);
  db.analytics = db.analytics.filter((a) => a.clientId !== id);
}
