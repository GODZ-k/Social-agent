import { eachDayOfInterval, endOfMonth, endOfWeek, format, startOfWeek } from "date-fns";
import type { PostStatus } from "@social-agent/shared";
import type { Post } from "@/lib/types";

export const WEEK = { weekStartsOn: 1 } as const;
export const dayKey = (d: Date) => format(d, "yyyy-MM-dd");
export const postDate = (p: Post) => p.scheduledFor ?? p.publishedAt;

export const CHIP: Record<PostStatus, string> = {
  scheduled: "bg-tint text-tint-foreground",
  approved: "bg-tint text-tint-foreground",
  published: "bg-secondary text-muted-foreground",
  in_review: "bg-warning/14 text-warning",
  draft: "border border-dashed text-muted-foreground",
  rejected: "",
};

/** Posts by the day they go (or went) out, each day in time order. A rejected post never goes out. */
export function groupByDay(posts: Post[]): Map<string, Post[]> {
  const map = new Map<string, Post[]>();
  for (const post of posts) {
    const when = postDate(post);
    if (!when || post.status === "rejected") continue;
    const key = dayKey(new Date(when));
    map.set(key, [...(map.get(key) ?? []), post]);
  }
  for (const list of map.values()) list.sort((a, b) => postDate(a)!.localeCompare(postDate(b)!));
  return map;
}

/** Every day on the month's grid: whole weeks, so the edges of the month fill their rows. */
export function monthDays(month: Date): Date[] {
  const start = startOfWeek(month, WEEK);
  const monthEnd = endOfMonth(month);
  const end = endOfWeek(monthEnd, WEEK);
  return eachDayOfInterval({ start, end });
}
