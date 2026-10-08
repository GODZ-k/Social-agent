import type { PostView } from "./types";
import { per100 } from "./report-format";

export interface PostReason {
  text: string;
  tone: "good" | "low";
}

export const WORST_POST_REASON: PostReason = { text: "Fewest people reached in this period.", tone: "low" };

/** A short, honest line about one of the best posts, built only from its own numbers against the period average. */
export function bestPostReason(post: PostView, avgReach: number, rank: number): PostReason {
  const metrics = post.metrics!;
  if (rank === 0) {
    const multiple = avgReach > 0 ? Math.round(metrics.reach / avgReach) : 1;
    return {
      text: multiple > 1 ? `Reached about ${multiple} times your average post.` : "Your best post this period by reach.",
      tone: "good",
    };
  }
  const savesRate = per100(metrics.saves, metrics.reach);
  return { text: `${savesRate} of every 100 people who saw it saved it.`, tone: "good" };
}
