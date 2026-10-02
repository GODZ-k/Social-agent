import "server-only";
import { platformSchema } from "@social-agent/shared";
import type { Platform } from "@social-agent/shared";
import type { Brand, ConnectionState, OnboardingState, Preferences, SocialAccountRow } from "@/lib/types";
import { stateOf } from "./posts";
import type { SeedData } from "./seed";

/** Settings and onboarding views of one brand: accounts, preferences and where onboarding stands. */

export function connectionOf(db: SeedData, brand: Brand, platform: Platform): ConnectionState {
  const account = brand.accounts.find((a) => a.platform === platform);
  if (account) return account.status;
  return db.extras[brand.id]?.connectErrors[platform] ? "connect_failed" : "not_connected";
}

/** Every platform: the planned ones first, then the rest so they can be added. */
export function socialAccounts(db: SeedData, brand: Brand): SocialAccountRow[] {
  const extras = db.extras[brand.id];
  const platforms = platformSchema.options.slice().sort(
    (a, b) => Number(brand.platforms.includes(b)) - Number(brand.platforms.includes(a)),
  );
  const own = db.posts.filter((p) => p.brandId === brand.id);
  return platforms.map((platform) => {
    const account = brand.accounts.find((a) => a.platform === platform);
    const postsWaiting = own.filter((p) => p.platform === platform && stateOf(p, brand) === "waiting_for_connection").length;
    return {
      platform,
      inPlan: brand.platforms.includes(platform),
      state: connectionOf(db, brand, platform),
      handle: account?.handle ?? null,
      connectedAt: account?.connectedAt ?? null,
      expiresAt: extras?.accessExpiresAt[platform] ?? null,
      postsWaiting,
      connectError: account ? null : (extras?.connectErrors[platform] ?? null),
    };
  });
}

export function preferencesOf(db: SeedData, brand: Brand): Preferences {
  return {
    timezone: brand.preferences.timezone,
    postLanguage: db.extras[brand.id]?.postLanguage ?? "en",
    chatLanguage: brand.preferences.chatLanguage ?? "en",
    approvalEmails: brand.preferences.approvalEmails,
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
export function keepClockTimes(db: SeedData, brand: Brand, from: string, to: string) {
  const now = Date.now();
  for (const post of db.posts) {
    if (post.brandId !== brand.id || !post.scheduledFor || post.status === "published") continue;
    const at = new Date(post.scheduledFor);
    if (at.getTime() < now) continue;
    const shift = offsetMinutes(from, at) - offsetMinutes(to, at);
    post.scheduledFor = new Date(at.getTime() + shift * 60_000).toISOString();
  }
}

export function onboardingOf(db: SeedData, brand: Brand): OnboardingState {
  const connections = brand.platforms.map((platform) => ({ platform, state: connectionOf(db, brand, platform) }));
  const connectSkipped = db.extras[brand.id]?.connectSkipped ?? false;
  const questionnaire = db.questionnaires[brand.id]?.state.status ?? "not_started";
  const research = db.research[brand.id]?.view.status ?? null;
  const connected = connections.some((c) => c.state === "connected");
  // An approved questionnaire ends onboarding. Discovery runs on from there, but it runs in the
  // workspace, so it no longer holds this screen open; `research` is still reported for the caller.
  let step: OnboardingState["step"] = "done";
  if (!connected && !connectSkipped) step = "connect";
  else if (questionnaire !== "approved") step = "questionnaire";
  return { brandId: brand.id, step, platforms: brand.platforms, connections, connectSkipped, questionnaire, research };
}
