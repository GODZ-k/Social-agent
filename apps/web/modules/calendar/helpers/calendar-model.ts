import { eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, parse, parseISO, startOfDay, startOfWeek } from "date-fns";
import type { Platform } from "@social-agent/shared";
import type { PostState, PostView, Strategy } from "@/lib/types";
import { PLATFORM_LABEL } from "@repo/ui/components/social/platform";
import { bestTimesOnDay } from "@/components/post/best-times-on-day";

export const WEEK = { weekStartsOn: 1 } as const;
export const dayKey = (d: Date) => format(d, "yyyy-MM-dd");
export const postDate = (p: PostView) => p.scheduledFor ?? p.publishedAt;

/** "9:30am": the compact time a chip has room for. */
export function shortTime(date: Date): string {
  return format(date, "h:mma").toLowerCase();
}

const listFormat = new Intl.ListFormat("en", { type: "conjunction" });

/** "Instagram, TikTok and LinkedIn". */
export function platformNames(platforms: Platform[]): string {
  const labels = platforms.map((p) => PLATFORM_LABEL[p]);
  return listFormat.format(labels);
}

/** Each platform that has an approved post held back by a missing connection, once. */
export function waitingPlatforms(posts: PostView[]): Platform[] {
  const waiting = posts.filter((p) => p.state === "waiting_for_connection");
  return [...new Set(waiting.map((p) => p.platform))];
}

/** Posts that go (or went) out in the given month. */
export function postsInMonth(posts: PostView[], month: Date): PostView[] {
  return posts.filter((p) => {
    const when = postDate(p);
    return when ? isSameMonth(parseISO(when), month) : false;
  });
}

/** Left border colour per state, the same colours as `CalendarLegend`'s dots: a post's standing reads at a glance. */
export const STATE_BORDER: Record<PostState, string> = {
  needs_approval: "border-l-warning",
  scheduled: "border-l-tint-foreground",
  waiting_for_connection: "border-l-muted-foreground",
  published: "border-l-success",
  draft: "border-l-muted-foreground",
  failed: "border-l-destructive",
  rejected: "border-l-destructive",
};

/** The dashed "free best time" pill, same treatment in the month grid and the agenda. */
export const FREE_CHIP = "block truncate rounded-lg border border-dashed border-muted-foreground/35 px-2 py-1 text-[0.6875rem] text-muted-foreground";

/** Posts by the day they go (or went) out, each day in time order. A rejected post never goes out. */
export function groupByDay(posts: PostView[]): Map<string, PostView[]> {
  const map = new Map<string, PostView[]>();
  for (const post of posts) {
    const when = postDate(post);
    if (!when || post.state === "rejected") continue;
    const key = dayKey(new Date(when));
    map.set(key, [...(map.get(key) ?? []), post]);
  }
  for (const list of map.values()) list.sort((a, b) => postDate(a)!.localeCompare(postDate(b)!));
  return map;
}

/** A day with nothing planned still names its next free best time, so the grid never looks simply blank. */
export function freeBestTimeOnDay(strategy: Strategy | null, day: Date): string | null {
  if (!strategy || startOfDay(day) < startOfDay(new Date())) return null;
  for (const { platform } of strategy.cadence) {
    const slot = bestTimesOnDay(strategy, platform, day)[0];
    if (slot) {
      const time = parse(slot.time, "HH:mm", day);
      return shortTime(time);
    }
  }
  return null;
}

/** How many days of the month have nothing planned but still offer a free best time. */
export function freeDayCount(days: Date[], month: Date, byDay: Map<string, PostView[]>, strategy: Strategy | null): number {
  const freeDays = days.filter((d) => isSameMonth(d, month) && !byDay.has(dayKey(d)) && freeBestTimeOnDay(strategy, d));
  return freeDays.length;
}

const plural = (count: number, noun: string) => `${count} ${noun}${count === 1 ? "" : "s"}`;

/** "3 posts this month: 1 post needs your approval, 2 posts are approved and waiting for TikTok." */
function postsLine(monthPosts: PostView[]): string {
  if (monthPosts.length === 0) return "Nothing scheduled this month yet.";

  const needsApproval = monthPosts.filter((p) => p.state === "needs_approval").length;
  const waiting = monthPosts.filter((p) => p.state === "waiting_for_connection");

  const clauses: string[] = [];
  if (needsApproval) clauses.push(`${plural(needsApproval, "post")} need${needsApproval === 1 ? "s" : ""} your approval`);
  if (waiting.length) {
    const platforms = waitingPlatforms(waiting);
    const names = platformNames(platforms);
    clauses.push(`${plural(waiting.length, "post")} ${waiting.length === 1 ? "is" : "are"} approved and waiting for ${names}`);
  }

  const total = `${plural(monthPosts.length, "post")} this month`;
  if (clauses.length === 0) return `${total}.`;
  return `${total}: ${clauses.join(", ")}.`;
}

/** The month panel's one-line summary: what needs doing, and how much room is still open. */
export function monthSummary(monthPosts: PostView[], freeCount: number): string {
  if (monthPosts.length === 0 && freeCount === 0) return "Nothing planned this month yet.";

  const line = postsLine(monthPosts);
  if (freeCount === 0) return line;
  return `${line} ${plural(freeCount, "best time")} still free; the agent drafts about a week ahead.`;
}

/** Every day on the month's grid: whole weeks, so the edges of the month fill their rows. */
export function monthDays(month: Date): Date[] {
  const start = startOfWeek(month, WEEK);
  const monthEnd = endOfMonth(month);
  const end = endOfWeek(monthEnd, WEEK);
  return eachDayOfInterval({ start, end });
}
