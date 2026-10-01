import "server-only";
import { buildSeed, newBrandExtras, type SeedData } from "./seed";
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

export function getDb(): SeedData {
  if (!globalThis.__cadenceMockDb) {
    const seed = buildSeed();
    globalThis.__cadenceMockDb = recounted(seed);
  }
  return globalThis.__cadenceMockDb;
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
