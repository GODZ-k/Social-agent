/**
 * The single seam between the UI and the backend.
 *
 * Every function is async and returns plain JSON-shaped data, so swapping the
 * mock for the real API means replacing a function body with
 * `return http<Client[]>("/clients")` — no component or hook changes.
 */
import { db } from "./mock-db";
import type {
  Analytics,
  BrandKit,
  BrandScanStep,
  Client,
  NewClientInput,
  Post,
  PostStatus,
  Strategy,
} from "@/lib/types";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Ready for the real backend. Unused while the mock is in place. */
export async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string } | null;
    throw new ApiError(body?.message ?? res.statusText, res.status);
  }
  return res.json() as Promise<T>;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const clone = <T,>(v: T): T => structuredClone(v);

export async function listClients(): Promise<Client[]> {
  await wait(350);
  return clone(db.clients);
}

export async function getClient(id: string): Promise<Client> {
  await wait(250);
  const client = db.clients.find((c) => c.id === id);
  if (!client) throw new ApiError("This client doesn't exist or was removed.", 404);
  return clone(client);
}

export const BRAND_SCAN_STEPS: BrandScanStep[] = [
  { id: "fetch", label: "Reading the website", detail: "Home, about and product pages" },
  { id: "visual", label: "Picking out the visual identity", detail: "Colours, typefaces and imagery" },
  { id: "voice", label: "Listening to how they write", detail: "Tone, vocabulary and sentence length" },
  { id: "audience", label: "Working out who it's for", detail: "Offers, pricing and customer language" },
];

/** Step 1 of onboarding: the agent reads a URL and drafts a brand kit. */
export async function scanWebsite(
  url: string,
  onStep?: (index: number) => void,
): Promise<{ name: string; industry: string; brand: BrandKit }> {
  for (let i = 0; i < BRAND_SCAN_STEPS.length; i++) {
    onStep?.(i);
    await wait(1100);
  }
  onStep?.(BRAND_SCAN_STEPS.length);

  const host = new URL(url).hostname.replace(/^www\./, "");
  const stem = host.split(".")[0] ?? host;
  const name = stem
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    name,
    industry: "Local business",
    brand: {
      tagline: `What ${name} is known for, in one line`,
      summary: `${name} sells directly to customers through ${host}. The site is product-led with a friendly, straightforward tone and a small, consistent colour palette.`,
      audience: "Local customers, 25–45, who discover brands on Instagram",
      voice: ["Friendly", "Straightforward", "Confident"],
      colors: [
        { name: "Primary", hex: "#2F6FDE" },
        { name: "Background", hex: "#F2F5FA" },
        { name: "Ink", hex: "#1C2433" },
        { name: "Highlight", hex: "#F2B441" },
      ],
      fonts: { heading: "Poppins", body: "Inter" },
    },
  };
}

export async function createClient(input: NewClientInput): Promise<Client> {
  await wait(700);
  const id =
    input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") ||
    `client-${db.clients.length + 1}`;
  const client: Client = {
    id: db.clients.some((c) => c.id === id) ? `${id}-${Date.now().toString(36)}` : id,
    name: input.name,
    url: input.url,
    industry: input.industry,
    accent: input.brand.colors[0]?.hex ?? "#4B3FE4",
    stage: "strategy",
    brand: input.brand,
    platforms: input.platforms,
    createdAt: new Date().toISOString(),
    stats: { followers: 0, followersDelta: 0, engagementRate: 0, engagementDelta: 0, scheduled: 0, pendingApprovals: 0 },
  };
  db.clients.unshift(client);
  const template = db.strategies[0]!;
  db.strategies.push({
    ...clone(template),
    clientId: client.id,
    version: 1,
    generatedAt: new Date().toISOString(),
    goal: `Turn ${client.name}'s website visitors into followers, and followers into customers.`,
    learnings: [],
    cadence: input.platforms.map((platform, i) => ({
      platform,
      perWeek: [4, 3, 2, 2][i] ?? 2,
      bestTimes: ["Tue 8:00am", "Thu 6:00pm"],
    })),
  });
  db.analytics.push({ clientId: client.id, series: [], byFormat: [], byPillar: [] });
  return clone(client);
}

export async function getStrategy(clientId: string): Promise<Strategy> {
  await wait(400);
  const strategy = db.strategies.find((s) => s.clientId === clientId);
  if (!strategy) throw new ApiError("No strategy has been generated for this client yet.", 404);
  return clone(strategy);
}

/** The "AI learns → new strategy" step of the loop. */
export async function regenerateStrategy(clientId: string): Promise<Strategy> {
  await wait(2400);
  const strategy = db.strategies.find((s) => s.clientId === clientId);
  if (!strategy) throw new ApiError("No strategy has been generated for this client yet.", 404);
  strategy.version += 1;
  strategy.generatedAt = new Date().toISOString();
  // Shift the mix toward the leading pillar, as the agent would after a good month.
  const [lead, ...rest] = strategy.pillars;
  if (lead && rest.length && lead.share <= 55) {
    const last = rest[rest.length - 1]!;
    const shift = Math.min(5, last.share - 5);
    if (shift > 0) {
      lead.share += shift;
      last.share -= shift;
    }
  }
  return clone(strategy);
}

export async function listPosts(clientId: string): Promise<Post[]> {
  await wait(450);
  return clone(db.posts.filter((p) => p.clientId === clientId));
}

export async function generatePosts(clientId: string, count: number): Promise<Post[]> {
  await wait(2200);
  const existing = db.posts.filter((p) => p.clientId === clientId);
  const strategy = db.strategies.find((s) => s.clientId === clientId);
  const client = db.clients.find((c) => c.id === clientId);
  if (!strategy || !client) throw new ApiError("Generate a strategy before creating content.", 409);

  const created: Post[] = Array.from({ length: count }, (_, i) => {
    const pillar = strategy.pillars[i % strategy.pillars.length]!;
    const format = (["reel", "carousel", "image"] as const)[i % 3]!;
    const when = new Date();
    when.setDate(when.getDate() + 3 + i * 2);
    when.setHours(9 + (i % 3) * 4, 0, 0, 0);
    return {
      id: `${clientId}-g${Date.now().toString(36)}${i}`,
      clientId,
      platform: client.platforms[i % client.platforms.length]!,
      format,
      pillarId: pillar.id,
      hook: `${pillar.name}, take ${existing.length + i + 1}`,
      caption: `${pillar.description} Drafted from strategy v${strategy.version}. Edit anything that doesn't sound like ${client.name}.`,
      hashtags: [`#${pillar.id}`, "#smallbusiness"],
      status: "in_review",
      scheduledFor: when.toISOString(),
      publishedAt: null,
      art: { variant: (existing.length + i) % 4, colorIndex: i % client.brand.colors.length },
      durationSec: format === "reel" ? 10 : undefined,
      aiNote: `Fits "${pillar.name}" (${pillar.share}% of the mix) and fills an empty slot in the next two weeks.`,
    };
  });
  db.posts.push(...created);
  client.stats.pendingApprovals += created.length;
  return clone(created);
}

export interface PostPatch {
  status?: PostStatus;
  caption?: string;
  hook?: string;
  scheduledFor?: string | null;
}

export async function updatePost(postId: string, patch: PostPatch): Promise<Post> {
  await wait(300);
  const post = db.posts.find((p) => p.id === postId);
  if (!post) throw new ApiError("This post no longer exists.", 404);
  const wasPending = post.status === "in_review";
  Object.assign(post, patch);
  // An approved post with a slot goes straight onto the schedule.
  if (patch.status === "approved" && post.scheduledFor) post.status = "scheduled";
  const client = db.clients.find((c) => c.id === post.clientId);
  if (client && wasPending && post.status !== "in_review") {
    client.stats.pendingApprovals = Math.max(0, client.stats.pendingApprovals - 1);
    if (post.status === "scheduled") client.stats.scheduled += 1;
  } else if (client && !wasPending && post.status === "in_review") {
    // A decision was undone: the post is back in the queue.
    client.stats.pendingApprovals += 1;
  }
  return clone(post);
}

export async function getAnalytics(clientId: string): Promise<Analytics> {
  await wait(500);
  const analytics = db.analytics.find((a) => a.clientId === clientId);
  if (!analytics) throw new ApiError("No analytics yet. They appear after the first post is published.", 404);
  return clone(analytics);
}
