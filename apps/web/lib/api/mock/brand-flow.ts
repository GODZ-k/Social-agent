import "server-only";
import { addMinutes } from "date-fns";
import { DEFAULT_ACCENT } from "@social-agent/shared";
import type { Client, NewClientInput, Strategy } from "@/lib/types";
import * as research from "./research";
import type { SeedData } from "./seed";
import { AUTO_START_MINUTES } from "./strategy";

/** Steps that touch more than one record: a new brand, and research that drafts the first strategy. */

const slugOf = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function newClient(db: SeedData, input: NewClientInput, ownerId: string): Client {
  const slug = slugOf(input.name) || `brand-${db.clients.length + 1}`;
  const now = new Date().toISOString();
  return {
    id: db.clients.some((c) => c.id === slug) ? `${slug}-${Date.now().toString(36)}` : slug,
    ownerId,
    name: input.name,
    url: input.url,
    industry: input.industry,
    accent: input.brand.colors[0]?.hex ?? DEFAULT_ACCENT,
    status: "active",
    stage: "onboarding",
    brand: input.brand,
    business: {},
    platforms: input.platforms,
    accounts: [],
    preferences: { timezone: "Asia/Kolkata", approvalEmails: true, chatLanguage: "en" },
    createdAt: now,
    // The onboarding scan just built this kit, so both read the same moment.
    kitScannedAt: now,
    kitEditedAt: now,
    stats: { followers: 0, followersDelta: 0, engagementRate: 0, engagementDelta: 0, scheduled: 0, pendingApprovals: 0 },
  };
}

const GENERIC_PILLARS: Strategy["pillars"] = [
  { id: "craft", name: "How it's made", description: "The work up close, from start to finish.", share: 40 },
  { id: "product", name: "What's new", description: "Launches, restocks and what sold out.", share: 30 },
  { id: "people", name: "The people", description: "The faces behind the business and the customers they serve.", share: 20 },
  { id: "offer", name: "The offer", description: "What to buy and how, stated plainly once a week.", share: 10 },
];

/** Research done drafts strategy v1, which starts on its own after the auto-start wait. */
function firstStrategy(client: Client, db: SeedData): Strategy {
  const generatedAt = new Date();
  const brief = db.research[client.id]?.view.growthBrief?.content;
  return {
    clientId: client.id,
    version: 1,
    status: "draft",
    generatedAt: generatedAt.toISOString(),
    autoStartsAt: addMinutes(generatedAt, AUTO_START_MINUTES).toISOString(),
    activatedAt: null,
    approvedBy: null,
    changeNote: null,
    goal: brief?.growthLever ?? `Turn ${client.name}'s website visitors into followers, and followers into customers.`,
    pillars: structuredClone(GENERIC_PILLARS),
    cadence: client.platforms.map((platform, i) => ({
      platform,
      perWeek: [4, 3, 2, 2][i] ?? 2,
      bestTimes: ["Tue 8:00am", "Thu 6:00pm"],
    })),
    audience: [{ segment: "Core", note: client.brand.audience }],
    learnings: [],
  };
}

/** Brings a brand's research up to date and drafts the first strategy when the first run finishes. */
export function settleResearch(db: SeedData, client: Client) {
  const record = db.research[client.id];
  if (!record) return null;
  const view = research.settle(record, client);
  const hasStrategy = db.strategies.some((s) => s.clientId === client.id);
  if (view.status === "done" && !hasStrategy) {
    const strategy = firstStrategy(client, db);
    db.strategies.push(strategy);
    client.stage = "strategy";
  }
  return view;
}
