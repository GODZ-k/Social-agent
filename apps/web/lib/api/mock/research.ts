import "server-only";
import { subDays, subHours } from "date-fns";
import type { AudienceProfile, GrowthBrief, ResearchStepId } from "@social-agent/shared";
import type { Client, ResearchSource, ResearchView } from "@/lib/types";

/**
 * A mock of business discovery. `POST /brands/:id/research` becomes `run`, and
 * progress is a function of elapsed time like the scan: one step every few seconds.
 * A re-run keeps the current version readable until the new one is saved.
 */

const STEPS: ResearchStepId[] = ["gather", "diagnose", "profile", "save"];
const STEP_MS = 2500;

/** What "small shops like yours" get, from research. Rates are per 100 people reached. */
export interface Benchmark {
  reachPerPost: number;
  savesPer100: number;
  interactionsPer100: number;
  /** New followers per month, as a share of followers. */
  followerGrowth: number;
}

export interface ResearchRecord {
  view: ResearchView;
  run: { startedAt: number } | null;
  benchmark: Benchmark;
}

/** Similar shops reach about a fifth of their followers per post, and never fewer than 280 people. */
const benchmarkFor = (client: Client): Benchmark => ({
  reachPerPost: Math.max(280, Math.round(client.stats.followers * 0.22)),
  savesPer100: 1.4,
  interactionsPer100: 5,
  followerGrowth: 0.012,
});

const hostOf = (client: Pick<Client, "url">) => new URL(client.url).hostname.replace(/^www\./, "");

const OVERRIDES: Record<string, Partial<Pick<GrowthBrief, "growthLever" | "opening" | "bottleneck" | "competitors">>> = {
  "kiln-and-clay": {
    growthLever: "Build a waiting list before every batch drop, so each drop sells out in two days.",
    bottleneck: { kind: "conversion", why: "People love the process videos but only 1 in 40 visits the shop after one." },
    opening: "No studio nearby shows the full throw-to-table story. Unedited process is open ground.",
  },
  "tartine-bakery": {
    growthLever: "Show the first bake as it happens, so the queue turns into pre-orders.",
    bottleneck: { kind: "repeat", why: "Visitors come once for the famous loaf; locals do not know about weekday pre-orders." },
    opening: "Nobody posts the 5am bake live. The craft is the story and it is unfilmed.",
    competitors: [
      { name: "Arsicault", url: "https://arsicault-bakery.com", note: "Queues on Instagram, few posts about the craft" },
      { name: "Josey Baker Bread", url: "https://joseybakerbread.com", note: "Strong on classes; posts twice a month" },
      { name: "b. patisserie", url: "https://bpatisserie.com", note: "Beautiful product shots, no people" },
    ],
  },
};

export function briefFor(client: Client): GrowthBrief {
  const override = OVERRIDES[client.id] ?? {};
  return {
    businessModel: {
      sells: client.brand.summary.split(". ")[0]!,
      toWhom: client.brand.audience,
      howMoneyIsMade: "Direct sales, online and in person, with most revenue from returning customers.",
    },
    bottleneck: override.bottleneck ?? { kind: "trust", why: "People who try it come back, but few people have heard of it yet." },
    growthLever: override.growthLever ?? `Show how ${client.name} works up close, so new people trust it enough to try it.`,
    priorityOffers: [
      { name: "The best seller", why: "Most reorders and the best reviews" },
      { name: "A first-time offer", why: "Lowers the risk of a first order" },
    ],
    kpis: [
      { name: "New followers a month", target: "+8%", why: "The audience that later buys" },
      { name: "Saves per post", target: "3 per 100 people reached", why: "A save means they plan to come back" },
      { name: "Website visits from social", why: "The step before an order" },
    ],
    competitors: override.competitors ?? [
      { name: "The big name in the category", note: "Big budget, polished posts, little about how it is made" },
      { name: "A local rival", note: "Strong in person; slow to reply online" },
    ],
    opening: override.opening ?? "Nobody shows how the product is made. Short, honest process posts are open ground.",
    constraints: ["Two people run the studio; at most five posts a week can be filmed"],
    openQuestions: [],
    confidence: { level: "medium", why: "Based on the website, reviews and the owner's answers; no account data yet." },
  };
}

export function profileFor(client: Client): AudienceProfile {
  return {
    segments: [
      {
        name: "Core buyers",
        summary: client.brand.audience,
        pains: ["Hard to tell good from mass-made", "No time to research"],
        desires: ["Something made with care", "To feel they chose well"],
        objections: ["Price compared with supermarket options"],
        language: [{ phrase: "Worth every penny, I keep coming back.", source: "Google reviews" }],
        platforms: client.platforms,
        contentThatLands: ["Process close-ups", "Honest before and after", "Faces behind the brand"],
        triggers: ["A limited batch", "A friend's recommendation"],
        basis: "evidence",
      },
      {
        name: "Gift buyers",
        summary: "Buy for someone else around holidays and birthdays.",
        pains: ["Don't know what to choose"],
        desires: ["A gift that looks personal"],
        objections: ["Delivery time"],
        language: [{ phrase: "Bought it as a present and ended up keeping one.", source: "Your answers" }],
        platforms: ["instagram"],
        contentThatLands: ["Gift guides", "Packaging reveals"],
        triggers: ["Holiday countdowns"],
        basis: "hypothesis",
      },
    ],
    followerGap: client.accounts.length > 0 ? "Followers skew local and older than the buyers the owner wants." : "Unknown until accounts are connected.",
    competitorAudienceNotes: ["Rivals' followers ask about ingredients and process more than price."],
  };
}

function sourcesFor(client: Client): ResearchSource[] {
  const host = hostOf(client);
  return [
    { url: `https://${host}/`, title: `${host} home page`, kind: "website", note: "The offer, prices and tone" },
    { url: `https://${host}/about`, title: "About page", kind: "website", note: "The story and the people behind it" },
    { url: `https://www.google.com/maps/search/${encodeURIComponent(client.name)}`, title: "Google reviews", kind: "reviews", note: "212 reviews, 4.8 stars" },
    { url: `https://www.trustpilot.com/review/${host}`, title: "Trustpilot", kind: "reviews", note: "What customers praise and complain about" },
    { url: "questionnaire", title: "Your answers", kind: "answers", note: "8 answers and 1 follow-up" },
    { url: `https://www.google.com/search?q=${encodeURIComponent(client.industry + " near me")}`, title: `${client.industry} near me`, kind: "search", note: "What people ask before buying" },
    { url: "https://www.instagram.com/explore/", title: "Similar brands on Instagram", kind: "similar_brand", note: "Posts, offers and how often they post" },
  ];
}

function emptyView(client: Client): ResearchView {
  return {
    brandId: client.id,
    status: null,
    currentStep: null,
    error: null,
    growthBrief: null,
    audienceProfile: null,
    startedAt: null,
    finishedAt: null,
    sources: [],
    versions: [],
  };
}

function writeVersion(view: ResearchView, client: Client, at: Date) {
  const version = (view.versions[0]?.version ?? 0) + 1;
  const sources = sourcesFor(client);
  const urls = sources.map((s) => s.url);
  const createdAt = at.toISOString();
  view.growthBrief = { version, content: briefFor(client), sources: urls, createdAt };
  view.audienceProfile = { version, content: profileFor(client), sources: urls, createdAt };
  view.sources = sources;
  view.versions.unshift({ version, createdAt });
}

const DONE = new Set(["kiln-and-clay", "northbound-coffee", "form-pilates", "harbour-dental", "tartine-bakery"]);

/** Established brands have research (Kiln & Clay has two versions); Don Angie's first run failed at saving. */
export function buildResearch(clients: Client[]): Record<string, ResearchRecord> {
  const now = new Date();
  return Object.fromEntries(
    clients.map((client) => {
      const view = emptyView(client);
      const created = new Date(client.createdAt);
      if (client.id === "kiln-and-clay") writeVersion(view, client, subDays(now, 40));
      if (DONE.has(client.id)) {
        const finished = client.id === "tartine-bakery" ? subHours(now, 1) : subDays(created, -1);
        writeVersion(view, client, finished);
        Object.assign(view, { status: "done", startedAt: subHours(finished, 1).toISOString(), finishedAt: finished.toISOString() });
      }
      if (client.id === "don-angie") {
        Object.assign(view, {
          status: "failed",
          currentStep: "save",
          error: "The research was written, but it could not be saved. Your answers are kept.",
          startedAt: subHours(now, 3).toISOString(),
          finishedAt: subHours(now, 3).toISOString(),
        });
      }
      return [client.id, { view, run: null, benchmark: benchmarkFor(client) }];
    }),
  );
}

export function newResearch(client: Client): ResearchRecord {
  return { view: emptyView(client), run: null, benchmark: benchmarkFor(client) };
}

/** Starts a run. The current version stays readable while it runs. */
export function run(record: ResearchRecord) {
  if (record.view.status === "running" || record.view.status === "queued") return;
  const startedAt = Date.now();
  record.run = { startedAt };
  Object.assign(record.view, {
    status: "running",
    currentStep: STEPS[0],
    error: null,
    startedAt: new Date(startedAt).toISOString(),
    finishedAt: null,
  });
}

/** Moves a running record forward to where elapsed time says it is. */
export function settle(record: ResearchRecord, client: Client): ResearchView {
  const job = record.run;
  if (!job) return record.view;
  const step = Math.floor((Date.now() - job.startedAt) / STEP_MS);
  if (step < STEPS.length) {
    record.view.currentStep = STEPS[step]!;
    return record.view;
  }
  const finished = new Date(job.startedAt + STEPS.length * STEP_MS);
  writeVersion(record.view, client, finished);
  Object.assign(record.view, { status: "done", currentStep: null, finishedAt: finished.toISOString() });
  record.run = null;
  return record.view;
}
