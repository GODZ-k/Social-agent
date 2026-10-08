import { differenceInCalendarDays } from "date-fns";
import type { PostView } from "./types";

/** "Tomorrow", "In 3 days", "In a week": how the content list reads a date next to the clock time. */
export function relativeDayLabel(date: Date): string {
  const days = differenceInCalendarDays(date, new Date());
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  if (days === 7) return "In a week";
  if (days > 0) return `In ${days} days`;
  return `${Math.abs(days)} days ago`;
}

/** "5 slides" or "45 seconds", when the format carries a count; null otherwise. */
export function formatDetail(post: PostView): string | null {
  if (post.format === "carousel" && post.slides) return `${post.slides} slide${post.slides === 1 ? "" : "s"}`;
  if ((post.format === "reel" || post.format === "story") && post.durationSec) {
    return post.durationSec < 60 ? `${post.durationSec} seconds` : `${Math.round(post.durationSec / 60)} minutes`;
  }
  return null;
}
