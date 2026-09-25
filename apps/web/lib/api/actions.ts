"use server";

import { revalidatePath } from "next/cache";
import { getViewer } from "@/lib/auth/viewer";
import { getDb, recounted, removeClient } from "./mock/db";
import * as scans from "./mock/scan";
import { handleFor } from "./mock/seed";
import { fail, ok, type ActionResult } from "./result";
import type { Platform } from "@social-agent/shared";
import type {
  Client,
  ClientPatch,
  NewClientInput,
  Post,
  PostPatch,
  Scan,
  Strategy,
} from "@/lib/types";

/**
 * Writes, called from client components as Server Actions.
 *
 * Every action authenticates first, changes the mock, revalidates the routes
 * that show the changed data, and returns an ActionResult. Against the real
 * API each body becomes one HTTP call; the revalidation stays.
 */

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const clone = <T,>(v: T): T => structuredClone(v);

const NOT_FOUND = "This client doesn't exist, or you don't have access to it.";

/** Same answer for "missing" and "not yours", so ids can't be probed. */
async function requireClient(id: string): Promise<Client> {
  const viewer = await getViewer();
  const client = getDb().clients.find((c) => c.id === id);
  if (!client || (viewer.role !== "admin" && client.ownerId !== viewer.id)) throw new Error(NOT_FOUND);
  return client;
}

function revalidateClient(clientId: string) {
  revalidatePath("/");
  revalidatePath(`/c/${clientId}`, "layout");
}

/** Runs an action body and turns any thrown error into a result. */
async function attempt<T>(body: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    const data = await body();
    return ok(data);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Something went wrong.");
  }
}

export async function startScan(url: string): Promise<ActionResult<{ scanId: string }>> {
  return attempt(async () => {
    const viewer = await getViewer();
    return { scanId: scans.start(url, viewer.id) };
  });
}

export async function readScan(scanId: string): Promise<ActionResult<Scan>> {
  return attempt(async () => {
    const viewer = await getViewer();
    const scan = scans.read(scanId, viewer.id);
    if (!scan) throw new Error("That scan has expired. Start again.");
    return scan;
  });
}

export async function createClient(input: NewClientInput): Promise<ActionResult<Client>> {
  return attempt(async () => {
    await wait(700);
    const viewer = await getViewer();
    const db = getDb();
    const slug = input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `client-${db.clients.length + 1}`;
    const client: Client = {
      id: db.clients.some((c) => c.id === slug) ? `${slug}-${Date.now().toString(36)}` : slug,
      ownerId: viewer.id,
      name: input.name,
      url: input.url,
      industry: input.industry,
      accent: input.brand.colors[0]?.hex ?? "#4B3FE4",
      stage: "strategy",
      brand: input.brand,
      platforms: input.platforms,
      accounts: [],
      preferences: { timezone: "Asia/Kolkata", approvalEmails: true },
      createdAt: new Date().toISOString(),
      stats: { followers: 0, followersDelta: 0, engagementRate: 0, engagementDelta: 0, scheduled: 0, pendingApprovals: 0 },
    };
    db.clients.unshift(client);
    const strategy = firstStrategy(client, db.strategies[0]!);
    db.strategies.push(strategy);
    db.analytics.push({ clientId: client.id, series: [], byFormat: [], byPillar: [] });
    revalidatePath("/");
    return clone(client);
  });
}

/** A new client starts from the template strategy, with the cadence set to its own platforms. */
function firstStrategy(client: Client, template: Strategy): Strategy {
  return {
    ...clone(template),
    clientId: client.id,
    version: 1,
    generatedAt: new Date().toISOString(),
    goal: `Turn ${client.name}'s website visitors into followers, and followers into customers.`,
    learnings: [],
    cadence: client.platforms.map((platform, i) => ({
      platform,
      perWeek: [4, 3, 2, 2][i] ?? 2,
      bestTimes: ["Tue 8:00am", "Thu 6:00pm"],
    })),
  };
}

/** Settings: brand kit, planned platforms and preferences. */
export async function updateClient(id: string, patch: ClientPatch): Promise<ActionResult<Client>> {
  return attempt(async () => {
    await wait(600);
    const client = await requireClient(id);
    Object.assign(client, patch);
    // The workspace accent always follows the first brand colour.
    if (patch.brand) client.accent = patch.brand.colors[0]?.hex ?? client.accent;
    revalidateClient(id);
    return clone(client);
  });
}

/**
 * Connect a social profile.
 *
 * Against the real API this is a redirect, not a request: the API returns the
 * network's OAuth consent URL, the browser goes there, and the network sends the
 * person back to Settings with the account connected. The mock skips the trip
 * and connects a handle derived from the client's name.
 */
export async function connectAccount(clientId: string, platform: Platform): Promise<ActionResult<Client>> {
  return attempt(async () => {
    await wait(1400);
    const client = await requireClient(clientId);
    client.accounts = [
      ...client.accounts.filter((a) => a.platform !== platform),
      { platform, handle: handleFor(client.name), status: "connected", connectedAt: new Date().toISOString() },
    ];
    revalidateClient(clientId);
    return clone(client);
  });
}

export async function disconnectAccount(clientId: string, platform: Platform): Promise<ActionResult<Client>> {
  return attempt(async () => {
    await wait(500);
    const client = await requireClient(clientId);
    client.accounts = client.accounts.filter((a) => a.platform !== platform);
    revalidateClient(clientId);
    return clone(client);
  });
}

export async function deleteClient(id: string): Promise<ActionResult<null>> {
  return attempt(async () => {
    await wait(700);
    await requireClient(id);
    removeClient(id);
    revalidateClient(id);
    return null;
  });
}

/** The "AI learns → new strategy" step of the loop. */
export async function regenerateStrategy(clientId: string): Promise<ActionResult<Strategy>> {
  return attempt(async () => {
    await wait(2400);
    await requireClient(clientId);
    const strategy = getDb().strategies.find((s) => s.clientId === clientId);
    if (!strategy) throw new Error("No strategy has been generated for this client yet.");
    strategy.version += 1;
    strategy.generatedAt = new Date().toISOString();
    shiftMixTowardLeader(strategy);
    revalidateClient(clientId);
    return clone(strategy);
  });
}

/** Shift the mix toward the leading pillar, as the agent would after a good month. */
function shiftMixTowardLeader(strategy: Strategy) {
  const [lead, ...rest] = strategy.pillars;
  const last = rest[rest.length - 1];
  if (!lead || !last || lead.share > 55) return;
  const shift = Math.min(5, last.share - 5);
  if (shift <= 0) return;
  lead.share += shift;
  last.share -= shift;
}

export async function generatePosts(clientId: string, count: number): Promise<ActionResult<Post[]>> {
  return attempt(async () => {
    await wait(2200);
    const client = await requireClient(clientId);
    const db = getDb();
    const strategy = db.strategies.find((s) => s.clientId === clientId);
    if (!strategy) throw new Error("Generate a strategy before creating content.");
    const existing = db.posts.filter((p) => p.clientId === clientId).length;
    const created = Array.from({ length: count }, (_, i) => draftPost(client, strategy, existing + i, i));
    db.posts.push(...created);
    recounted(db);
    revalidateClient(clientId);
    return clone(created);
  });
}

function draftPost(client: Client, strategy: Strategy, serial: number, offset: number): Post {
  const pillar = strategy.pillars[offset % strategy.pillars.length]!;
  const format = (["reel", "carousel", "image"] as const)[offset % 3]!;
  const when = new Date();
  when.setDate(when.getDate() + 3 + offset * 2);
  when.setHours(9 + (offset % 3) * 4, 0, 0, 0);
  return {
    id: `${client.id}-g${Date.now().toString(36)}${offset}`,
    clientId: client.id,
    platform: client.platforms[offset % client.platforms.length]!,
    format,
    pillarId: pillar.id,
    hook: `${pillar.name}, take ${serial + 1}`,
    caption: `${pillar.description} Drafted from strategy v${strategy.version}. Edit anything that doesn't sound like ${client.name}.`,
    hashtags: [`#${pillar.id}`, "#smallbusiness"],
    status: "in_review",
    scheduledFor: when.toISOString(),
    publishedAt: null,
    art: { variant: serial % 4, colorIndex: offset % client.brand.colors.length },
    durationSec: format === "reel" ? 10 : undefined,
    aiNote: `Fits "${pillar.name}" (${pillar.share}% of the mix) and fills an empty slot in the next two weeks.`,
  };
}

export async function updatePost(postId: string, patch: PostPatch): Promise<ActionResult<Post>> {
  return attempt(async () => {
    await wait(300);
    const db = getDb();
    const post = db.posts.find((p) => p.id === postId);
    if (!post) throw new Error("This post no longer exists.");
    await requireClient(post.clientId);
    Object.assign(post, patch);
    // An approved post with a slot goes straight onto the schedule.
    if (patch.status === "approved" && post.scheduledFor) post.status = "scheduled";
    recounted(db);
    revalidateClient(post.clientId);
    return clone(post);
  });
}
