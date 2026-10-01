import "server-only";
import { addDays, format, isSameDay, parseISO, startOfDay, subDays } from "date-fns";
import type { Platform } from "@social-agent/shared";
import type {
  AnalyticsBreakdown,
  AnalyticsRange,
  AnalyticsReport,
  AnalyticsTotal,
  Brand,
  PostView,
  Verdict,
} from "@/lib/types";
import { postsOf } from "./posts";
import type { Benchmark } from "./research";
import type { SeedData } from "./seed";

/** The analytics report, computed from published posts and judged against the research benchmark. */

type Published = PostView & { metrics: NonNullable<PostView["metrics"]>; publishedAt: string };

const interactionsOf = (p: Published) => p.metrics.likes + p.metrics.comments + p.metrics.shares;

function sumOf(posts: Published[]) {
  const reach = posts.reduce((n, p) => n + p.metrics.reach, 0);
  const saves = posts.reduce((n, p) => n + p.metrics.saves, 0);
  const interactions = posts.reduce((n, p) => n + interactionsOf(p), 0);
  const followers = posts.reduce((n, p) => n + (p.metrics.follows ?? 0), 0);
  return { reach, saves, interactions, followers };
}

function verdictOf(value: number, benchmark: number | null, tooEarly: boolean): Verdict {
  if (tooEarly || !benchmark) return "too_early";
  const ratio = value / benchmark;
  if (ratio >= 1.6) return "very_good";
  if (ratio >= 1.15) return "good";
  if (ratio >= 0.85) return "usual";
  return "below";
}

function breakdown(posts: Published[]): AnalyticsBreakdown {
  const sums = sumOf(posts);
  const engagementRate = sums.reach ? +((sums.interactions / sums.reach) * 100).toFixed(1) : 0;
  return { posts: posts.length, reach: sums.reach, saves: sums.saves, engagementRate };
}

function groupBy<K extends string>(posts: Published[], key: (p: Published) => K) {
  const groups = new Map<K, Published[]>();
  for (const post of posts) {
    const k = key(post);
    const group = groups.get(k);
    if (group) group.push(post);
    else groups.set(k, [post]);
  }
  return [...groups.entries()];
}

/** `empty` before the first post goes out; `first_week` until seven days of results. */
function phaseOf(firstAt: string | undefined, to: Date): AnalyticsReport["phase"] {
  if (!firstAt) return "empty";
  if (parseISO(firstAt) > subDays(to, 7)) return "first_week";
  return "month";
}

/** A post's reach lands over three days: most on the day, less on the next two. */
const SPREAD = [0.6, 0.3, 0.1];

function daysOf(posts: Published[], from: Date, to: Date): AnalyticsReport["days"] {
  const days: AnalyticsReport["days"] = [];
  for (let day = startOfDay(from); day <= to; day = addDays(day, 1)) {
    let reach = 0;
    let saves = 0;
    let follows = 0;
    SPREAD.forEach((share, back) => {
      const source = subDays(day, back);
      for (const post of posts.filter((p) => isSameDay(parseISO(p.publishedAt), source))) {
        reach += post.metrics.reach * share;
        saves += post.metrics.saves * share;
        follows += (post.metrics.follows ?? 0) * share;
      }
    });
    const postedOn = [...new Set(posts.filter((p) => isSameDay(parseISO(p.publishedAt), day)).map((p) => p.platform))];
    days.push({ date: format(day, "yyyy-MM-dd"), reach: Math.round(reach), saves: Math.round(saves), follows: Math.round(follows), postedOn });
  }
  return days;
}

export function report(db: SeedData, brand: Brand, range: AnalyticsRange, benchmark: Benchmark): AnalyticsReport {
  const to = new Date();
  const from = subDays(to, range);
  const all = postsOf(db, brand.id).filter((p): p is Published => p.state === "published" && !!p.metrics && !!p.publishedAt);
  const inRange = (p: Published, start: Date, end: Date) => {
    const at = parseISO(p.publishedAt);
    return at >= start && at <= end;
  };
  const posts = all.filter((p) => inRange(p, from, to));
  const previousPosts = all.filter((p) => inRange(p, subDays(from, range), from));
  const firstAt = all.map((p) => p.publishedAt).sort()[0];
  const phase = phaseOf(firstAt, to);

  const sums = sumOf(posts);
  const previous = previousPosts.length ? sumOf(previousPosts) : null;
  const tooEarly = phase === "empty" || (phase === "first_week" && posts.length < 3);
  const benchmarks = {
    reach: benchmark.reachPerPost * posts.length,
    saves: (benchmark.savesPer100 * sums.reach) / 100,
    interactions: (benchmark.interactionsPer100 * sums.reach) / 100,
    followers: benchmark.followerGrowth * brand.stats.followers * (range / 30),
  };
  const totals: AnalyticsTotal[] = (["reach", "saves", "interactions", "followers"] as const).map((key) => ({
    key,
    value: sums[key],
    previous: previous?.[key] ?? null,
    benchmark: phase === "empty" ? null : Math.round(benchmarks[key]),
    verdict: verdictOf(sums[key], benchmarks[key], tooEarly),
  }));

  const byReach = posts.slice().sort((a, b) => b.metrics.reach - a.metrics.reach);
  const best = byReach.slice(0, 3);
  const worst = byReach.slice(3).reverse().slice(0, 3);
  const learnings = db.strategies.find((s) => s.brandId === brand.id)?.learnings ?? [];

  return {
    brandId: brand.id,
    phase,
    range,
    from: from.toISOString(),
    to: to.toISOString(),
    postCount: posts.length,
    platforms: [...new Set(posts.map((p) => p.platform))] as Platform[],
    totals,
    followers: { from: brand.stats.followers - sums.followers, to: brand.stats.followers },
    days: phase === "empty" ? [] : daysOf(posts, from, to),
    bestPosts: best,
    worstPosts: worst,
    byFormat: groupBy(posts, (p) => p.format).map(([format, group]) => ({ format, ...breakdown(group) })),
    byPlatform: groupBy(posts, (p) => p.platform).map(([platform, group]) => ({ platform, ...breakdown(group) })),
    byTheme: groupBy(posts, (p) => p.pillarId).map(([pillarId, group]) => ({ pillarId, name: group[0]!.theme, ...breakdown(group) })),
    learnings: structuredClone(learnings),
  };
}
