import "server-only";
import { addDays, endOfDay, endOfMonth, format, isSameDay, parseISO, startOfDay, startOfMonth } from "date-fns";
import type { Platform, Weekday } from "@social-agent/shared";
import type {
  BestTimeSlot,
  CalendarMonth,
  Client,
  ContentFilters,
  Post,
  PostState,
  PostView,
  Strategy,
  ThisWeek,
} from "@/lib/types";
import type { SeedData } from "./seed";

/** Derived post views: state, theme, ordering, the week, the month and best times. Pure over the store. */

const isConnected = (client: Client, platform: Platform) =>
  client.accounts.some((a) => a.platform === platform && a.status === "connected");

export function stateOf(post: Post, client: Client): PostState {
  if (post.failure) return "failed";
  if (post.status === "in_review") return "needs_approval";
  if (post.status === "published") return "published";
  if (post.status === "draft" || post.status === "rejected") return post.status;
  // Approved and scheduled posts wait while their account is not connected.
  return isConnected(client, post.platform) ? "scheduled" : "waiting_for_connection";
}

export function viewOf(db: SeedData, post: Post): PostView {
  const client = db.clients.find((c) => c.id === post.clientId)!;
  const strategy = db.strategies.find((s) => s.clientId === post.clientId);
  const theme = strategy?.pillars.find((p) => p.id === post.pillarId)?.name ?? post.pillarId;
  return { ...structuredClone(post), state: stateOf(post, client), theme };
}

const whenOf = (post: Post) => post.scheduledFor ?? post.publishedAt ?? "9999";

export const soonestFirst = (a: Post, b: Post) => whenOf(a).localeCompare(whenOf(b));

export function postsOf(db: SeedData, clientId: string): PostView[] {
  const own = db.posts.filter((p) => p.clientId === clientId);
  return own.map((post) => viewOf(db, post));
}

export function content(db: SeedData, clientId: string, filters: ContentFilters): PostView[] {
  const views = postsOf(db, clientId);
  const matching = views.filter(
    (p) => (!filters.state || p.state === filters.state) && (!filters.platform || p.platform === filters.platform),
  );
  return matching.sort(soonestFirst);
}

export function thisWeek(db: SeedData, clientId: string): ThisWeek {
  // Rolling seven days from today, not the calendar week, so "Today" is always the first tile.
  const from = startOfDay(new Date());
  const to = endOfDay(addDays(from, 6));
  const posts = postsOf(db, clientId)
    .filter((p) => {
      const when = parseISO(whenOf(p));
      return when >= from && when <= to;
    })
    .sort(soonestFirst);
  const counts: ThisWeek["counts"] = {};
  for (const post of posts) counts[post.state] = (counts[post.state] ?? 0) + 1;
  return { from: from.toISOString(), to: to.toISOString(), posts, counts };
}

/** The next post waiting for approval after this one, soonest first, wrapping to the start. */
export function nextWaiting(db: SeedData, clientId: string, afterId: string): string | null {
  const waiting = db.posts.filter((p) => p.clientId === clientId && p.status === "in_review" && !p.failure).sort(soonestFirst);
  const index = waiting.findIndex((p) => p.id === afterId);
  const next = waiting.slice(index + 1)[0] ?? waiting.find((p) => p.id !== afterId);
  return next?.id ?? null;
}

const WEEKDAYS: Weekday[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

const SLOT = /^(\w{3})\s+(\d{1,2}):(\d{2})\s*(am|pm)$/i;

/** "Tue 7:30am" becomes { day: "tue", time: "07:30", label: "7:30am" }. */
function parseSlot(slot: string) {
  const match = SLOT.exec(slot.trim());
  if (!match) return null;
  const [, day, hour, minute, meridiem] = match;
  const h = (Number(hour) % 12) + (meridiem!.toLowerCase() === "pm" ? 12 : 0);
  return {
    day: day!.toLowerCase() as Weekday,
    time: `${String(h).padStart(2, "0")}:${minute}`,
    label: `${Number(hour)}:${minute}${meridiem!.toLowerCase()}`,
  };
}

/** The strategy's best times on one date, for one platform or all of them. */
export function bestTimesOn(strategy: Strategy | undefined, date: Date, platform?: Platform): BestTimeSlot[] {
  const weekday = WEEKDAYS[date.getDay()]!;
  const cadence = strategy?.cadence.filter((c) => !platform || c.platform === platform) ?? [];
  return cadence.flatMap((entry) =>
    entry.bestTimes.flatMap((slot) => {
      const parsed = parseSlot(slot);
      return parsed && parsed.day === weekday ? [{ platform: entry.platform, time: parsed.time, label: parsed.label }] : [];
    }),
  );
}

/** Every day of the month with its posts and the best times still free. */
export function calendarMonth(db: SeedData, clientId: string, month: string): CalendarMonth {
  const first = startOfMonth(parseISO(`${month}-01`));
  const last = endOfMonth(first);
  const today = startOfDay(new Date());
  const strategy = db.strategies.find((s) => s.clientId === clientId);
  const posts = postsOf(db, clientId).sort(soonestFirst);
  const days: CalendarMonth["days"] = [];
  for (let day = first; day <= last; day = addDays(day, 1)) {
    const onDay = posts.filter((p) => isSameDay(parseISO(whenOf(p)), day));
    const taken = new Set(onDay.map((p) => p.platform));
    const free = day < today ? [] : bestTimesOn(strategy, day).filter((slot) => !taken.has(slot.platform));
    days.push({ date: format(day, "yyyy-MM-dd"), posts: onDay, freeBestTimes: free });
  }
  return { month, days };
}
