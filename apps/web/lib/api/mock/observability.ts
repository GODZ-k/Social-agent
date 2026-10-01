import "server-only";
import { subDays, subHours, subMinutes } from "date-fns";
import type {
  AgentRunDetail,
  AgentRunRow,
  FrontendErrorDetail,
  FrontendErrorRow,
  LatencyStat,
  LogRow,
  ObsAgents,
  ObsFilter,
  ObsFrontend,
  ObsOverview,
  ObsRange,
  ObsServer,
  Release,
  RunKind,
} from "@/lib/types";

/**
 * Observability, mock only: the numbers the Mastra usage exporter, SigNoz and Sentry
 * will serve later. Deterministic, relative to now, and named after the seeded brands.
 */

const now = () => new Date();

/** A rough multiplier so totals grow with the toolbar's chosen window. */
const RANGE_SCALE: Record<ObsRange, number> = { "24h": 1, "7d": 6.3, "30d": 24 };
const RANGE_PHRASE: Record<ObsRange, string> = { "24h": "the last 24 hours", "7d": "the last 7 days", "30d": "the last 30 days" };

const scale = (n: number, range: ObsRange) => Math.round(n * RANGE_SCALE[range]);
const scale2 = (n: number, range: ObsRange) => Math.round(n * RANGE_SCALE[range] * 100) / 100;

/** The "Add filter" client filter, applied to any row shaped with a `brandId`. */
function byBrand<T extends { brandId: string }>(rows: T[], filter: ObsFilter): T[] {
  return filter.brandId ? rows.filter((r) => r.brandId === filter.brandId) : rows;
}

/** A smooth, repeatable daily shape: quiet at night, busy in the afternoon. */
const wave = (hour: number, base: number, swing: number) =>
  Math.round(base + swing * Math.sin(((hour - 6) / 24) * Math.PI * 2) + ((hour * 37) % 11));

/** Server errors in an hour: the 1pm spike the error groups describe, a little every fifth hour. */
function serverErrorsAt(hour: number): number {
  if (hour === 13) return 9;
  if (hour % 5 === 0) return 2;
  return 1;
}

/** Sessions that hit an app error in an hour: mostly in the evening, after the release. */
function sessionsWithErrorAt(hour: number): number {
  if (hour >= 18 || hour < 2) return 2 + (hour % 3);
  if (hour % 4 === 0) return 1;
  return 0;
}

/** People who hit an error in an hour, the same evening shape as `sessionsWithErrorAt` but smaller (one person can hit more than one session). */
function peopleWithErrorAt(hour: number): number {
  if (hour >= 18 || hour < 2) return 1 + (hour % 2);
  if (hour % 6 === 0) return 1;
  return 0;
}

function lastHours<T>(make: (hour: number, at: string) => T): T[] {
  const end = now();
  return Array.from({ length: 24 }, (_, k) => {
    const at = subHours(end, 23 - k);
    return make(at.getHours(), at.toISOString());
  });
}

const BRANDS = {
  tartine: { brandId: "tartine-bakery", name: "Tartine Bakery" },
  meow: { brandId: "meow-meow-tweet", name: "Meow Meow Tweet" },
  don: { brandId: "don-angie", name: "Don Angie" },
  northbound: { brandId: "northbound-coffee", name: "Northbound Coffee" },
};

/** Recent releases, newest first, each with its own before/after read. The first is the current one. */
function releaseHistory(): { release: Release; releaseCheck: ObsFrontend["releaseCheck"] }[] {
  return [
    {
      release: { id: "rel_2026_09_25_1805", at: subHours(now(), 20).toISOString(), commit: "0fe5f30" },
      releaseCheck: {
        verdict: "worse",
        title: "The last release made things worse",
        detail: "More sessions hit an error since it went out, and 2 errors are new. Most come from the Approvals page.",
        before: 1.2,
        since: 6.8,
      },
    },
    {
      release: { id: "rel_2026_09_20_1130", at: subDays(now(), 5).toISOString(), commit: "4431f44" },
      releaseCheck: {
        verdict: "same",
        title: "This release made no real difference",
        detail: "Sessions with an error stayed about the same.",
        before: 1.4,
        since: 1.3,
      },
    },
    {
      release: { id: "rel_2026_09_15_0900", at: subDays(now(), 10).toISOString(), commit: "b285f64" },
      releaseCheck: {
        verdict: "better",
        title: "This release made things better",
        detail: "Fewer sessions hit an error after it went out.",
        before: 2.6,
        since: 1.4,
      },
    },
  ];
}

const release = (): Release => releaseHistory()[0]!.release;

export function overview(range: ObsRange, filter: ObsFilter): ObsOverview {
  const topClientsByCost = byBrand(
    [
      { ...BRANDS.northbound, cost: 1.42 },
      { ...BRANDS.tartine, cost: 0.96 },
      { ...BRANDS.meow, cost: 0.71 },
      { ...BRANDS.don, cost: 0.44 },
    ],
    filter,
  ).map((c) => ({ ...c, cost: scale2(c.cost, range) }));

  return {
    checkedAt: subMinutes(now(), 1).toISOString(),
    headline: {
      title: "The server is fine; the app has a new error",
      detail: `1 error in the app, 1 failed agent run and 1 slow route in ${RANGE_PHRASE[range]}.`,
    },
    apiErrorRate: { value: 0.4, previous: 0.3 },
    peopleWithError: {
      count: Math.min(scale(6, range), 38),
      of: 38,
      newErrors: 1,
      hourly: lastHours((hour) => peopleWithErrorAt(hour)),
    },
    aiCost: { value: scale2(3.82, range), previous: scale2(3.42, range) },
    agentRuns: {
      total: scale(48, range),
      failed: scale(1, range) || 1,
      hourly: lastHours((hour) => wave(hour, 2, 2)),
    },
    requests: lastHours((hour, at) => ({ at, count: wave(hour, 350, 200), errors: serverErrorsAt(hour) })),
    aiCostByDay: Array.from({ length: 7 }, (_, k) => ({
      date: subDays(now(), 6 - k).toISOString(),
      cost: [4.1, 3.6, 5.2, 4.4, 3.9, 3.4, 3.82][k]!,
    })),
    topClientsByCost,
    attention: [
      {
        id: "att_1",
        kind: "frontend_error",
        title: "New error on Approvals since the last release",
        detail: "5 people saw a blank page after pressing Approve.",
        at: subHours(now(), 19).toISOString(),
        targetId: "fe_platforms_undefined",
      },
      {
        id: "att_2",
        kind: "agent_run",
        title: "Business discovery failed for Don Angie",
        detail: "The research could not be saved.",
        at: subHours(now(), 3).toISOString(),
        targetId: "run_8f92a10b",
      },
      {
        id: "att_3",
        kind: "slow_route",
        title: "Starting a scan was slow for 12 minutes",
        detail: "POST /api/v1/scans took over 2 s at p95.",
        at: subHours(now(), 6).toISOString(),
        targetId: "POST /api/v1/scans",
      },
    ],
    clearedOnTheirOwn: 3,
  };
}

function recentRuns(): AgentRunRow[] {
  const run = (minutesAgo: number, agent: string, task: string, brand: { brandId: string; name: string }, status: AgentRunRow["status"], cost: number, id: string): AgentRunRow => ({
    id,
    startedAt: subMinutes(now(), minutesAgo).toISOString(),
    agent,
    task,
    brandId: brand.brandId,
    brandName: brand.name,
    status,
    cost,
  });
  return [
    run(14, "Account Manager", "Write the questionnaire for Meow Meow Tweet", BRANDS.meow, "ok", 0.01, "run_a1c0"),
    run(52, "Audience Researcher", "Find who buys country bread in the Mission", BRANDS.tartine, "ok", 0.06, "run_a1b9"),
    run(71, "Brand Analyst", "Read tartinebakery.com and draft the brand kit", BRANDS.tartine, "ok", 0.02, "run_a1b8"),
    run(180, "Growth Consultant", "Research competitors near Don Angie", BRANDS.don, "error", 0.31, "run_8f92a10b"),
    run(240, "Account Manager", "Review the answers from Northbound Coffee", BRANDS.northbound, "ok", 0.01, "run_a1b6"),
    run(300, "Audience Researcher", "Find the audience for natural deodorant", BRANDS.meow, "ok", 0.05, "run_a1b5"),
  ];
}

/** One run kind's typical and slowest-5% duration, hour by hour: agents are slowest, tools are quickest. */
const LATENCY_BY_KIND: Record<RunKind, { p50: number; p95: number; p50Swing: number; p95Swing: number }> = {
  agent: { p50: 41_400, p95: 110_800, p50Swing: 8_000, p95Swing: 20_000 },
  workflow: { p50: 96_000, p95: 208_000, p50Swing: 22_000, p95Swing: 38_000 },
  tool: { p50: 3_200, p95: 9_500, p50Swing: 1_200, p95Swing: 3_000 },
};

function latencyStatFor(kind: RunKind): LatencyStat {
  const stat = LATENCY_BY_KIND[kind];
  return {
    p50: stat.p50,
    p95: stat.p95,
    hourly: lastHours((hour, at) => ({ at, p50: wave(hour, stat.p50, stat.p50Swing), p95: wave(hour, stat.p95, stat.p95Swing) })),
  };
}

export function agents(range: ObsRange, filter: ObsFilter): ObsAgents {
  return {
    runs: { value: scale(40, range), previous: scale(32, range), hourly: lastHours((hour) => wave(hour, 2, 2)) },
    cost: { value: scale2(0.58, range), previous: scale2(0.46, range), hourly: lastHours((hour) => wave(hour, 3, 2) / 100) },
    tokens: { input: Math.round(1_500_000 * RANGE_SCALE[range]), output: Math.round(123_400 * RANGE_SCALE[range]) },
    models: [
      { model: "claude-opus-5", input: 1_300_000, output: 51_000, cached: 0, cost: 0.41 },
      { model: "claude-sonnet-5", input: 152_700, output: 72_300, cached: 0, cost: 0.15 },
      { model: "gpt-4.1-mini", input: 1_300, output: 43, cached: 0, cost: 0.02 },
    ],
    byAgent: [
      { agent: "Audience Researcher", input: 840_000, output: 47_700, cost: 0.24 },
      { agent: "Growth Consultant", input: 470_000, output: 33_900, cost: 0.19 },
      { agent: "Account Manager", input: 160_000, output: 31_200, cost: 0.11 },
      { agent: "Brand Analyst", input: 30_000, output: 5_100, cost: 0.04 },
    ],
    runsByName: [
      { name: "Account Manager", kind: "agent", completed: 28, errors: 0 },
      { name: "Brand Analyst", kind: "agent", completed: 6, errors: 0 },
      { name: "Growth Consultant", kind: "agent", completed: 2, errors: 1 },
      { name: "Audience Researcher", kind: "agent", completed: 3, errors: 0 },
      { name: "business-discovery", kind: "workflow", completed: 2, errors: 1 },
      { name: "brand-scan", kind: "workflow", completed: 6, errors: 0 },
      { name: "web-search", kind: "tool", completed: 41, errors: 2 },
      { name: "read-page", kind: "tool", completed: 30, errors: 0 },
    ],
    latency: latencyStatFor("agent"),
    latencyByKind: { agent: latencyStatFor("agent"), workflow: latencyStatFor("workflow"), tool: latencyStatFor("tool") },
    tokensHourly: lastHours((hour, at) => ({ at, input: wave(hour, 62_000, 40_000), output: wave(hour, 5_100, 3_000) })),
    costHourly: lastHours((hour, at) => ({ at, cost: wave(hour, 3, 2) / 100 })),
    costByClient: byBrand(
      [
        { ...BRANDS.northbound, cost: 0.22 },
        { ...BRANDS.tartine, cost: 0.16 },
        { ...BRANDS.meow, cost: 0.12 },
        { ...BRANDS.don, cost: 0.08 },
      ],
      filter,
    ).map((c) => ({ ...c, cost: scale2(c.cost, range) })),
    recentRuns: byBrand(recentRuns(), filter),
  };
}

function failedRun(): AgentRunDetail {
  const row = recentRuns().find((r) => r.id === "run_8f92a10b")!;
  return {
    ...row,
    agent: "Business discovery",
    workflow: "business-discovery",
    trigger: "The owner approved the questionnaire.",
    problem: {
      title: "The research was written, but it could not be saved.",
      advice: "The database took longer than 30 s to store it. Run it again; if it fails twice, check the database status in SigNoz.",
    },
    durationMs: 102_000,
    tokens: { input: 142_000, output: 42_000 },
    modelCalls: 3,
    traceId: "tr_01ha94bc72",
    costByAgent: [
      { agent: "Growth Consultant", cost: 0.19 },
      { agent: "Audience Researcher", cost: 0.12 },
    ],
    steps: [
      { id: "s1", name: "Read brand", type: "step", startMs: 0, durationMs: 4_200, cost: 0, status: "ok", tries: { used: 1, allowed: 1 }, error: null, input: { Brand: "Don Angie" }, output: { Facts: "Questionnaire and brand kit" } },
      { id: "s2", name: "Growth Consultant", type: "agent", startMs: 4_200, durationMs: 38_400, cost: 0.19, status: "ok", tries: { used: 1, allowed: 2 }, error: null, input: { Brand: "Don Angie" }, output: { Bottleneck: "Awareness" } },
      { id: "s3", name: "Web search", type: "tool", startMs: 8_000, durationMs: 8_300, cost: 0, status: "ok", tries: { used: 1, allowed: 1 }, error: null, input: { Query: "Italian restaurant West Village" }, output: { Results: "10" } },
      { id: "s4", name: "Read page", type: "tool", startMs: 18_000, durationMs: 12_000, cost: 0, status: "ok", tries: { used: 1, allowed: 1 }, error: null, input: { Page: "donangie.com/menu" }, output: { Words: "1,240" } },
      { id: "s5", name: "Audience Researcher", type: "agent", startMs: 42_600, durationMs: 28_600, cost: 0.12, status: "ok", tries: { used: 1, allowed: 2 }, error: null, input: { Brand: "Don Angie" }, output: { Segments: "3" } },
      { id: "s6", name: "Save research", type: "step", startMs: 71_200, durationMs: 30_800, cost: 0, status: "failed", tries: { used: 1, allowed: 1 }, error: "brand_research insert timed out after 30 s.", input: { Brand: "Don Angie", "Research sections": "14", "Sources read": "9 pages" }, output: { "Saves to": "brand_research" } },
    ],
  };
}

/** Run detail: the failed Don Angie run in full; the others as a short, successful run. */
export function runDetail(id: string): AgentRunDetail | null {
  if (id === "run_8f92a10b") return failedRun();
  const row = recentRuns().find((r) => r.id === id);
  if (!row) return null;
  return {
    ...row,
    workflow: row.agent,
    trigger: "Started by the owner's last step in onboarding.",
    problem: null,
    durationMs: 18_400,
    tokens: { input: 21_000, output: 3_200 },
    modelCalls: 1,
    traceId: `tr_${id.slice(4)}`,
    costByAgent: [{ agent: row.agent, cost: row.cost }],
    steps: [
      { id: "s1", name: row.agent, type: "agent", startMs: 0, durationMs: 18_400, cost: row.cost, status: "ok", tries: { used: 1, allowed: 2 }, error: null, input: { Brand: row.brandName }, output: { Result: "Saved" } },
    ],
  };
}

const LOGS: LogRow[] = [
  { id: "log_1", at: subMinutes(now(), 3).toISOString(), level: "warning", message: "Firecrawl rate limit reached. Retrying in 6 s.", traceId: "tr_01ha92cd44" },
  { id: "log_2", at: subMinutes(now(), 5).toISOString(), level: "info", message: "Scan finished for tartinebakery.com in 41 s.", traceId: "tr_01ha92cd44" },
  { id: "log_3", at: subMinutes(now(), 7).toISOString(), level: "error", message: "Research could not be saved: the insert timed out after 30 s.", traceId: "tr_01ha94bc72" },
  { id: "log_4", at: subMinutes(now(), 10).toISOString(), level: "info", message: "Business discovery started for Don Angie.", traceId: "tr_01ha94bc72" },
];

export function server(range: ObsRange, filter: ObsFilter): ObsServer {
  return {
    requests: { value: scale(8_412, range), previous: scale(7_921, range) },
    serverErrors: { rate: 0.4, count: scale(34, range) },
    p95Ms: { value: 380, previous: 368 },
    uptime30d: 99.98,
    hourly: lastHours((hour, at) => ({
      at,
      count: wave(hour, 350, 200),
      errors: serverErrorsAt(hour),
      p50: wave(hour, 85, 15),
      p95: wave(hour, 380, 80),
    })),
    routes: [
      { method: "POST", path: "/api/v1/brands/:brandId/research", requests: scale(1_100, range), errors: scale(29, range), p95Ms: 30_000 },
      { method: "POST", path: "/api/v1/scans", requests: scale(3_400, range), errors: scale(5, range), p95Ms: 2_100 },
      { method: "GET", path: "/api/v1/oauth/:platform/callback", requests: scale(11, range), errors: scale(3, range), p95Ms: 1_400 },
      { method: "GET", path: "/api/v1/brands", requests: scale(2_900, range), errors: scale(2, range), p95Ms: 96 },
      { method: "POST", path: "/api/v1/brands/:brandId/questionnaire/submit", requests: scale(64, range), errors: 0, p95Ms: 610 },
      { method: "GET", path: "/api/v1/me/overview", requests: scale(1_800, range), errors: 0, p95Ms: 140 },
    ],
    jobs: [
      { name: "Brand scans", note: "One at a time, so Firecrawl stays under 10 requests a minute.", waiting: 2, running: 1, longestWaitMs: 190_000, done: 31, failed: 2 },
      { name: "Business research", note: "Starts when a client submits the questionnaire.", waiting: 0, running: 1, longestWaitMs: 0, done: 9, failed: 1 },
    ],
    services: [
      { name: "Firecrawl", note: "Rate limited 14 times", calls: 412, failed: 6, p95Ms: 8_200 },
      { name: "Postgres (Neon)", note: "3 inserts timed out", calls: 6_200, failed: 3, p95Ms: 42 },
      { name: "Anthropic", note: "Model calls for the agents", calls: 96, failed: 0, p95Ms: 38_000 },
      { name: "OpenAI", note: "Model calls for the agents", calls: 12, failed: 0, p95Ms: 4_100 },
      { name: "Instagram", note: "4 token exchanges refused", calls: 11, failed: 4, p95Ms: 1_200 },
      { name: "Clerk", note: "Checks who is signed in", calls: 8_400, failed: 0, p95Ms: 6 },
    ],
    errorGroups: [
      { id: "se_1", message: "brand_research insert timed out after 30 s", route: "POST /api/v1/brands/:brandId/research", times: 29, brands: 3, lastSeenAt: subMinutes(now(), 40).toISOString(), traceId: "tr_01ha94bc72" },
      { id: "se_2", message: "Instagram token exchange failed: 400 invalid_grant", route: "GET /api/v1/oauth/:platform/callback", times: 3, brands: 2, lastSeenAt: subHours(now(), 2).toISOString(), traceId: "tr_01ha93ff10" },
      { id: "se_3", message: "Firecrawl scrape failed: 502 Bad Gateway", route: "POST /api/v1/scans", times: 2, brands: 2, lastSeenAt: subHours(now(), 16).toISOString(), traceId: "tr_01ha91aa02" },
    ],
    slowRequests: byBrand(
      [
        { method: "POST", path: "/api/v1/brands/:brandId/research", waitedOn: "Waiting on the database insert", tookMs: 30_000, brandId: BRANDS.don.brandId, brandName: BRANDS.don.name, at: subMinutes(now(), 40).toISOString(), traceId: "tr_01ha94bc72" },
        { method: "POST", path: "/api/v1/scans", waitedOn: "Waiting on Firecrawl", tookMs: 8_200, brandId: BRANDS.tartine.brandId, brandName: BRANDS.tartine.name, at: subHours(now(), 6).toISOString(), traceId: "tr_01ha92cd44" },
        { method: "GET", path: "/api/v1/oauth/:platform/callback", waitedOn: "Waiting on Instagram", tookMs: 1_400, brandId: BRANDS.meow.brandId, brandName: BRANDS.meow.name, at: subHours(now(), 2).toISOString(), traceId: "tr_01ha93ff10" },
      ],
      filter,
    ),
    logs: LOGS,
  };
}

function frontendErrors(fixed: string[]): FrontendErrorRow[] {
  const rows: FrontendErrorRow[] = [
    { id: "fe_platforms_undefined", message: "TypeError: Cannot read properties of undefined (reading 'platforms')", page: "/c/:brandId/approvals", effect: "Blank page after pressing Approve", status: "unresolved", newInRelease: true, people: 5, times: 14, firstSeenAt: subHours(now(), 19).toISOString(), lastSeenAt: subMinutes(now(), 12).toISOString(), traceId: "tr_01hb01aaee" },
    { id: "fe_chunk_load", message: "ChunkLoadError: Loading chunk 812 failed", page: "/onboarding", effect: "Tab opened before the release, needs a reload", status: "unresolved", newInRelease: true, people: 3, times: 4, firstSeenAt: subHours(now(), 20).toISOString(), lastSeenAt: subHours(now(), 2).toISOString(), traceId: "tr_01hb02bbff" },
    { id: "fe_hydration_tz", message: "Hydration failed: server and browser rendered different text", page: "/c/:brandId/calendar", effect: "Post times shown in the wrong time zone, then corrected", status: "unresolved", newInRelease: false, people: 2, times: 9, firstSeenAt: subDays(now(), 6).toISOString(), lastSeenAt: subHours(now(), 5).toISOString(), traceId: "tr_01hb03ccgg" },
    { id: "fe_invalid_time", message: "RangeError: Invalid time value", page: "/c/:brandId/strategy", effect: "Best times card did not load", status: "unresolved", newInRelease: false, people: 1, times: 2, firstSeenAt: subDays(now(), 3).toISOString(), lastSeenAt: subDays(now(), 1).toISOString(), traceId: "tr_01hb04ddhh" },
  ];
  return rows.map((row) => (fixed.includes(row.id) ? { ...row, status: "fixed" } : row));
}

export function frontend(fixed: string[], range: ObsRange, filter: ObsFilter): ObsFrontend {
  const errors = frontendErrors(fixed);
  const history = releaseHistory();
  const picked = history.find((r) => r.release.id === filter.releaseId) ?? history[0]!;

  return {
    release: picked.release,
    releaseCheck: picked.releaseCheck,
    releases: history.map((r) => r.release),
    peopleWithError: { count: Math.min(scale(6, range), 38), of: 38, previous: 2 },
    errorFreeSessions: { value: 96.2, previous: 98.6 },
    failedApiCalls: { count: scale(17, range), of: scale(3_100, range) },
    failedActions: { count: scale(14, range), of: scale(138, range) },
    sessionsWithError: lastHours((hour, at) => ({ at, count: sessionsWithErrorAt(hour) })),
    errorsByPage: [
      { page: "Approvals", people: 5 },
      { page: "Onboarding", people: 3 },
      { page: "Calendar", people: 2 },
      { page: "Strategy", people: 1 },
    ],
    errors,
    hiddenNoise: 11,
    actions: [
      { action: "Connect Instagram", reason: "Instagram refused the account: not a business or creator account", tried: scale(11, range), failed: scale(4, range) },
      { action: "Submit questionnaire", reason: "Research could not start: server error 500", tried: scale(9, range), failed: scale(3, range) },
      { action: "Start brand scan", reason: "The website blocked the reader", tried: scale(18, range), failed: scale(2, range) },
      { action: "Approve post", reason: "Blank page after pressing Approve", tried: scale(64, range), failed: scale(5, range) },
      { action: "Generate posts", reason: null, tried: scale(14, range), failed: 0 },
      { action: "Save brand kit", reason: null, tried: scale(22, range), failed: 0 },
    ],
    apiCalls: [
      { method: "POST", path: "/api/v1/brands/:brandId/research", doing: "Submitting the questionnaire", status: 500, failed: scale(6, range), people: scale(3, range), traceId: "tr_01ha94bc72" },
      { method: "GET", path: "/api/v1/me/overview", doing: "Opening the client dashboard", status: "timeout", failed: scale(7, range), people: scale(4, range), traceId: "tr_01ha95e001" },
      { method: "POST", path: "/api/v1/brands/:brandId/social-accounts/connect", doing: "Connecting Instagram", status: 400, failed: scale(4, range), people: scale(2, range), traceId: "tr_01ha93ff10" },
    ],
  };
}

export function frontendError(id: string, fixed: string[]): FrontendErrorDetail | null {
  const row = frontendErrors(fixed).find((e) => e.id === id);
  if (!row) return null;
  const seen = subMinutes(now(), 12);
  const onDesktop = Math.round(row.times * 0.8);
  const onChrome = Math.ceil(row.times * 0.65);
  const onSafari = Math.floor(row.times * 0.3);
  return {
    ...row,
    release: release(),
    hourly: lastHours((hour, at) => ({ at, count: hour >= 18 || hour < 2 ? 1 + (hour % 3) : 0 })),
    steps: [
      { at: subMinutes(seen, 0.2).toISOString(), kind: "navigation", text: `Opened ${row.page}` },
      { at: subMinutes(seen, 0.18).toISOString(), kind: "request", text: "Loaded posts: GET /api/v1/brands/:brandId/posts", status: 200, traceId: "tr_01hb05eeii" },
      { at: subMinutes(seen, 0.1).toISOString(), kind: "click", text: "Pressed Approve on a post for Instagram" },
      { at: seen.toISOString(), kind: "error", text: "The page broke and showed “Something went wrong”" },
    ],
    stack: [
      { frame: "PostSidePanel", file: "features/approvals/post-side-panel.tsx", line: 48, column: 31 },
      { frame: "ApprovalStack", file: "features/approvals/approval-stack.tsx", line: 112, column: 9 },
    ],
    foldedLibraryLines: 14,
    devices: { desktop: onDesktop, phone: row.times - onDesktop },
    browsers: [
      { name: "Chrome", times: onChrome },
      { name: "Safari", times: onSafari },
      { name: "Edge", times: row.times - onChrome - onSafari },
    ].filter((b) => b.times > 0),
    brands: [
      { ...BRANDS.tartine, times: 6, lastAt: seen.toISOString() },
      { ...BRANDS.meow, times: 4, lastAt: subHours(now(), 1).toISOString() },
      { ...BRANDS.northbound, times: 2, lastAt: subHours(now(), 3).toISOString() },
      { ...BRANDS.don, times: 2, lastAt: subHours(now(), 5).toISOString() },
    ],
  };
}
