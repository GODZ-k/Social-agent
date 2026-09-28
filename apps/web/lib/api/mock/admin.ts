import "server-only";
import { subDays } from "date-fns";
import type { AdminClientRow, BrandCard, Client, PendingScan } from "@/lib/types";
import { OWNERS, type MockPerson } from "./seed-people";
import type { SeedData } from "./seed";

/** The admin's view of clients (people): what needs them, derived from the brands. */

/**
 * A scan read before this session, waiting for the admin to check it. Held here
 * (not in `seed.ts`) so a fresh page load shows it again until `clearPendingScan` runs.
 */
const PENDING_SCANS: (PendingScan & { clientId: string })[] = [
  {
    clientId: OWNERS.priya,
    brandName: "Purr Pantry",
    url: "https://purrpantry.com",
    readAt: subDays(new Date(), 1).toISOString(),
    result: {
      name: "Purr Pantry",
      industry: "Pet food",
      brand: {
        tagline: "Small-batch cat food, made with real ingredients",
        summary: "Purr Pantry cooks small batches of cat food from real meat, with nothing artificial and nothing your cat can't pronounce.",
        audience: "Cat owners who read the ingredient list before they buy",
        voice: ["warm", "direct", "a little playful"],
        colors: [
          { name: "Ochre", hex: "#c98a2b" },
          { name: "Charcoal", hex: "#2b2420" },
        ],
        fonts: { heading: "Fraunces", body: "Inter" },
        aesthetic: "warm, tactile, lots of texture",
        keywords: ["cat food", "small batch", "real ingredients"],
      },
    },
  },
];

export function pendingScanFor(clientId: string): PendingScan | null {
  const found = PENDING_SCANS.find((s) => s.clientId === clientId);
  if (!found) return null;
  const { brandName, url, readAt, result } = found;
  return { brandName, url, readAt, result };
}

/** Called once the admin checks and saves the pending scan's brand kit, so it stops reappearing. */
export function clearPendingScan(clientId: string): void {
  const i = PENDING_SCANS.findIndex((s) => s.clientId === clientId);
  if (i >= 0) PENDING_SCANS.splice(i, 1);
}

export function brandCardOf(db: SeedData, client: Client): BrandCard {
  const pendingApprovals = db.posts.filter((p) => p.clientId === client.id && p.status === "in_review").length;
  return {
    id: client.id,
    name: client.name,
    url: client.url,
    accent: client.accent,
    status: client.status,
    stage: client.stage,
    pendingApprovals,
  };
}

export function rowOf(db: SeedData, person: MockPerson): AdminClientRow {
  const brands = db.clients.filter((c) => c.ownerId === person.id && c.status === "active");
  const cards = brands.map((brand) => brandCardOf(db, brand));
  const postsToApprove = cards.reduce((n, card) => n + card.pendingApprovals, 0);
  const expiredConnections = brands.flatMap((brand) =>
    brand.accounts
      .filter((a) => a.status === "expired")
      .map((a) => ({
        brandId: brand.id,
        brandName: brand.name,
        platform: a.platform,
        expiredAt: db.extras[brand.id]?.accessExpiresAt[a.platform] ?? a.connectedAt,
      })),
  );
  const failedResearch = brands.flatMap((brand) => {
    const view = db.research[brand.id]?.view;
    return view?.status === "failed" ? [{ kind: "research" as const, brandName: brand.name, at: view.finishedAt ?? view.startedAt ?? "" }] : [];
  });
  const failedScans = db.failedScans
    .filter((scan) => scan.ownerId === person.id)
    .map((scan) => ({ kind: "scan" as const, brandName: scan.brandName, at: scan.at }));
  const failedRuns = [...failedResearch, ...failedScans];
  const { invitedAt, lastSignedInAt, lastActivity, ...client } = person;
  return {
    ...structuredClone(client),
    brandCount: brands.length,
    brands: cards,
    postsToApprove,
    expiredConnections,
    failedRuns,
    lastActivity: { ...lastActivity },
    invitedAt,
    lastSignedInAt,
    needsYou: postsToApprove > 0 || expiredConnections.length > 0 || failedRuns.length > 0,
  };
}

/** Clients who need the admin first, then the most recently active. */
export function byNeedThenActivity(a: AdminClientRow, b: AdminClientRow) {
  if (a.needsYou !== b.needsYou) return a.needsYou ? -1 : 1;
  return (b.lastActivity.at ?? "").localeCompare(a.lastActivity.at ?? "");
}
