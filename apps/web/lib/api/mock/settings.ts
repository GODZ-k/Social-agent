import "server-only";
import { platformSchema } from "@social-agent/shared";
import type { Platform } from "@social-agent/shared";
import type { Client, ConnectionState, OnboardingState, Preferences, SocialAccountRow } from "@/lib/types";
import { stateOf } from "./posts";
import type { SeedData } from "./seed";

/** Settings and onboarding views of one brand: accounts, preferences and where onboarding stands. */

export function connectionOf(db: SeedData, client: Client, platform: Platform): ConnectionState {
  const account = client.accounts.find((a) => a.platform === platform);
  if (account) return account.status;
  return db.extras[client.id]?.connectErrors[platform] ? "connect_failed" : "not_connected";
}

/** Every platform: the planned ones first, then the rest so they can be added. */
export function socialAccounts(db: SeedData, client: Client): SocialAccountRow[] {
  const extras = db.extras[client.id];
  const platforms = platformSchema.options.slice().sort(
    (a, b) => Number(client.platforms.includes(b)) - Number(client.platforms.includes(a)),
  );
  const own = db.posts.filter((p) => p.clientId === client.id);
  return platforms.map((platform) => {
    const account = client.accounts.find((a) => a.platform === platform);
    const postsWaiting = own.filter((p) => p.platform === platform && stateOf(p, client) === "waiting_for_connection").length;
    return {
      platform,
      inPlan: client.platforms.includes(platform),
      state: connectionOf(db, client, platform),
      handle: account?.handle ?? null,
      connectedAt: account?.connectedAt ?? null,
      expiresAt: extras?.accessExpiresAt[platform] ?? null,
      postsWaiting,
      connectError: account ? null : (extras?.connectErrors[platform] ?? null),
    };
  });
}

export function preferencesOf(db: SeedData, client: Client): Preferences {
  return {
    timezone: client.preferences.timezone,
    postLanguage: db.extras[client.id]?.postLanguage ?? "en",
    chatLanguage: client.preferences.chatLanguage ?? "en",
    approvalEmails: client.preferences.approvalEmails,
  };
}

/** Minutes a timezone is ahead of UTC at a moment. */
function offsetMinutes(timeZone: string, at: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(at);
  const part = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const local = Date.UTC(part("year"), part("month") - 1, part("day"), part("hour"), part("minute"));
  return Math.round((local - at.getTime()) / 60_000);
}

/** A timezone change keeps each upcoming post at the same clock time (owner decision, S15). */
export function keepClockTimes(db: SeedData, client: Client, from: string, to: string) {
  const now = Date.now();
  for (const post of db.posts) {
    if (post.clientId !== client.id || !post.scheduledFor || post.status === "published") continue;
    const at = new Date(post.scheduledFor);
    if (at.getTime() < now) continue;
    const shift = offsetMinutes(from, at) - offsetMinutes(to, at);
    post.scheduledFor = new Date(at.getTime() + shift * 60_000).toISOString();
  }
}

export function onboardingOf(db: SeedData, client: Client): OnboardingState {
  const connections = client.platforms.map((platform) => ({ platform, state: connectionOf(db, client, platform) }));
  const connectSkipped = db.extras[client.id]?.connectSkipped ?? false;
  const questionnaire = db.questionnaires[client.id]?.state.status ?? "not_started";
  const research = db.research[client.id]?.view.status ?? null;
  const connected = connections.some((c) => c.state === "connected");
  let step: OnboardingState["step"] = "done";
  if (!connected && !connectSkipped) step = "connect";
  else if (questionnaire !== "approved") step = "questionnaire";
  else if (research !== "done") step = "research";
  return { clientId: client.id, step, platforms: client.platforms, connections, connectSkipped, questionnaire, research };
}
