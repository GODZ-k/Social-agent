import "server-only";
import { buildSeed, newBrandExtras, type SeedData } from "./seed";
import { OWNERS } from "./seed-people";
import { notStarted } from "./questionnaire";
import { newResearch } from "./research";
import type { Brand } from "@/lib/types";

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

export type { SeedData };

/**
 * Development only: hands one seeded client's brands to a real Clerk user id.
 *
 * `lib/api/server.ts` lets a non-admin reach a brand only when `brand.ownerId === viewer.id`, and
 * the seed owns everything through fixed ids (`user_priya`, `user_sam`, ...). A throwaway Clerk
 * account's id matches none of them, so it owns nothing: `/` redirects to onboarding and every
 * `/c/:brandId` is not-found. That is why the client-side workspace chrome has never been checked
 * in a browser — only the admin mirror, where the admin role bypasses ownership and paints
 * different chrome.
 *
 * Set `MOCK_BRAND_OWNER_ID` to a Clerk user id to give that account Priya's brands (two active, one
 * archived). Ignored in production, so it cannot widen access in a real deployment.
 *
 * Applied on every `getDb()` rather than once at build time: the database is cached on `globalThis`
 * to survive hot reloads, so a one-shot version would silently do nothing whenever the variable was
 * set after the server started — which is the normal case, since editing `.env.local` reloads the
 * route but keeps the process. Re-running it is idempotent and costs one pass over a dozen brands.
 */
function withTestOwner(db: SeedData): SeedData {
  const ownerId = process.env.MOCK_BRAND_OWNER_ID;
  if (!ownerId || process.env.NODE_ENV === "production") return db;
  for (const brand of db.brands) {
    if (brand.ownerId === OWNERS.priya) brand.ownerId = ownerId;
  }
  return db;
}

export function getDb(): SeedData {
  if (!globalThis.__cadenceMockDb) {
    const seed = buildSeed();
    globalThis.__cadenceMockDb = recounted(seed);
  }
  return withTestOwner(globalThis.__cadenceMockDb);
}

/** Headline counts are derived from the posts so lists and badges always agree. */
export function recounted(db: SeedData): SeedData {
  for (const brand of db.brands) {
    const own = db.posts.filter((p) => p.brandId === brand.id);
    brand.stats.pendingApprovals = own.filter((p) => p.status === "in_review").length;
    brand.stats.scheduled = own.filter((p) => p.status === "scheduled" || p.status === "approved").length;
  }
  return db;
}

/** Gives a brand made after the seed its questionnaire, research and onboarding records. */
export function addBrand(brand: Brand) {
  const db = getDb();
  db.brands.unshift(brand);
  db.extras[brand.id] = newBrandExtras();
  db.questionnaires[brand.id] = notStarted();
  db.research[brand.id] = newResearch(brand);
  db.strategyHistory[brand.id] = [];
  db.analytics.push({ brandId: brand.id, series: [], byFormat: [], byPillar: [] });
}

export function removeBrand(id: string) {
  const db = getDb();
  db.brands = db.brands.filter((c) => c.id !== id);
  db.strategies = db.strategies.filter((s) => s.brandId !== id);
  db.posts = db.posts.filter((p) => p.brandId !== id);
  db.analytics = db.analytics.filter((a) => a.brandId !== id);
  delete db.strategyHistory[id];
  delete db.extras[id];
  delete db.questionnaires[id];
  delete db.research[id];
}
