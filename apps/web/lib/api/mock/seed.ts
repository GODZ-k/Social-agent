/**
 * Seed data for the server-side mock. Everything here is deterministic, with
 * dates generated relative to "now" so the calendar and charts are always
 * populated. Only `lib/api/mock/db.ts` may import this file.
 */
import { addDays, addHours, startOfDay, subDays } from "date-fns";
import type { Platform, PostFormat, PostStatus } from "@social-agent/shared";
import type {
  Analytics,
  Client,
  Post,
  Strategy,
} from "@/lib/types";

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const today = startOfDay(new Date());

/** Seeded demo clients belong to the agency, so only admins see them. */
export const SEED_OWNER = "agency";

const seedClients: Omit<Client, "accounts" | "preferences">[] = [
  {
    id: "kiln-and-clay",
    ownerId: SEED_OWNER,
    name: "Kiln & Clay",
    url: "https://kilnandclay.studio",
    industry: "Handmade ceramics",
    accent: "#B4532A",
    stage: "approval",
    platforms: ["instagram", "facebook", "tiktok"],
    createdAt: subDays(today, 64).toISOString(),
    brand: {
      tagline: "Tableware thrown by hand in small batches",
      summary:
        "A two-person pottery studio selling stoneware mugs, bowls and planters online and at weekend markets. The site leans on process photography and a calm, tactile tone.",
      audience:
        "Home cooks and gift buyers, 27–45, who value craft over convenience",
      voice: ["Warm", "Unhurried", "Hands-on", "Plain-spoken"],
      colors: [
        { name: "Fired clay", hex: "#B4532A" },
        { name: "Slip", hex: "#E9DFD0" },
        { name: "Glaze", hex: "#2F5D62" },
        { name: "Kiln ash", hex: "#3A3633" },
      ],
      fonts: { heading: "Fraunces", body: "Karla" },
    },
    stats: {
      followers: 18420,
      followersDelta: 6.2,
      engagementRate: 5.4,
      engagementDelta: 0.8,
      scheduled: 9,
      pendingApprovals: 5,
    },
  },
  {
    id: "northbound-coffee",
    ownerId: SEED_OWNER,
    name: "Northbound Coffee",
    url: "https://northbound.coffee",
    industry: "Specialty coffee roaster",
    accent: "#1F6F54",
    stage: "publishing",
    platforms: ["instagram", "tiktok"],
    createdAt: subDays(today, 121).toISOString(),
    brand: {
      tagline: "Single-origin beans, roasted every Tuesday",
      summary:
        "A subscription-first roaster with one café. The site is direct and a little nerdy about sourcing, with tasting notes on every product page.",
      audience: "Remote workers and home brewers, 24–40, subscription-minded",
      voice: ["Direct", "Curious", "A little nerdy", "Dry humour"],
      colors: [
        { name: "Pine", hex: "#1F6F54" },
        { name: "Crema", hex: "#F3E7D3" },
        { name: "Roast", hex: "#4A2C1A" },
        { name: "Cherry", hex: "#D1483B" },
      ],
      fonts: { heading: "Space Grotesk", body: "Inter" },
    },
    stats: {
      followers: 42960,
      followersDelta: 3.1,
      engagementRate: 4.1,
      engagementDelta: -0.3,
      scheduled: 14,
      pendingApprovals: 2,
    },
  },
  {
    id: "form-pilates",
    ownerId: SEED_OWNER,
    name: "Form Pilates",
    url: "https://formpilates.co",
    industry: "Boutique fitness studio",
    accent: "#7A4FD6",
    stage: "learning",
    platforms: ["instagram", "facebook"],
    createdAt: subDays(today, 203).toISOString(),
    brand: {
      tagline: "Reformer classes for people who sit all day",
      summary:
        "Three studios across the city offering reformer and mat classes. The site sells intro packs and leans on instructor personalities.",
      audience: "Desk workers, 28–50, mostly women, new to reformer pilates",
      voice: ["Encouraging", "Precise", "Never preachy"],
      colors: [
        { name: "Iris", hex: "#7A4FD6" },
        { name: "Chalk", hex: "#F4F1F8" },
        { name: "Mat", hex: "#2B2440" },
        { name: "Peach", hex: "#F2A488" },
      ],
      fonts: { heading: "DM Serif Display", body: "DM Sans" },
    },
    stats: {
      followers: 9870,
      followersDelta: 11.4,
      engagementRate: 6.8,
      engagementDelta: 1.9,
      scheduled: 6,
      pendingApprovals: 0,
    },
  },
  {
    id: "harbour-dental",
    ownerId: SEED_OWNER,
    name: "Harbour Dental",
    url: "https://harbourdental.clinic",
    industry: "Family dental clinic",
    accent: "#1B76C9",
    stage: "strategy",
    platforms: ["instagram", "facebook", "linkedin"],
    createdAt: subDays(today, 6).toISOString(),
    brand: {
      tagline: "Gentle dentistry for nervous patients",
      summary:
        "A family clinic that built its reputation on anxious-patient care. The site foregrounds the team, clear pricing and same-week appointments.",
      audience: "Local families and anxious adults, 30–60, within 10 km",
      voice: ["Reassuring", "Clear", "Jargon-free"],
      colors: [
        { name: "Harbour", hex: "#1B76C9" },
        { name: "Foam", hex: "#EAF4FB" },
        { name: "Deep water", hex: "#12324F" },
        { name: "Mint", hex: "#58C4A7" },
      ],
      fonts: { heading: "Manrope", body: "Manrope" },
    },
    stats: {
      followers: 2140,
      followersDelta: 0.9,
      engagementRate: 1.7,
      engagementDelta: 0,
      scheduled: 0,
      pendingApprovals: 0,
    },
  },
];

export const handleFor = (name: string) => "@" + name.toLowerCase().replace(/[^a-z0-9]+/g, "");

const clients: Client[] = seedClients.map((client) => ({
  ...client,
  // Established clients are connected; the newest one hasn't got that far, and one
  // token has lapsed so the "reconnect" state is visible.
  accounts:
    client.stage === "strategy"
      ? []
      : client.platforms.map((platform) => ({
          platform,
          handle: handleFor(client.name),
          status: client.id === "northbound-coffee" && platform === "tiktok" ? ("expired" as const) : ("connected" as const),
          connectedAt: client.createdAt,
        })),
  preferences: { timezone: "Asia/Kolkata", approvalEmails: true },
}));

const pillarSets: Record<string, Strategy["pillars"]> = {
  "kiln-and-clay": [
    { id: "process", name: "At the wheel", description: "Throwing, trimming and glazing, shown close up and unedited.", share: 40 },
    { id: "product", name: "New from the kiln", description: "Batch drops, restocks and what sold out.", share: 30 },
    { id: "home", name: "On the table", description: "Pieces in real kitchens, customer photos first.", share: 20 },
    { id: "studio", name: "Studio notes", description: "Market dates, mistakes and the two people behind it.", share: 10 },
  ],
  "northbound-coffee": [
    { id: "origin", name: "Where it's from", description: "One farm, one story, one bag at a time.", share: 35 },
    { id: "brew", name: "Brew better", description: "Short, specific technique for home brewers.", share: 35 },
    { id: "roast", name: "Roast day", description: "Tuesday in the roastery, start to finish.", share: 20 },
    { id: "cafe", name: "At the bar", description: "Regulars, specials and staff picks.", share: 10 },
  ],
  "form-pilates": [
    { id: "move", name: "One move", description: "A single exercise, cued the way instructors cue it.", share: 40 },
    { id: "desk", name: "Desk body", description: "What sitting does, and the fix that takes two minutes.", share: 30 },
    { id: "team", name: "Meet the instructors", description: "Faces and teaching styles before the first class.", share: 20 },
    { id: "offer", name: "Intro pack", description: "The offer, stated plainly, once a week.", share: 10 },
  ],
  "harbour-dental": [
    { id: "calm", name: "Nothing to fear", description: "What actually happens in the chair, step by step.", share: 40 },
    { id: "care", name: "Two-minute care", description: "Daily habits explained without the lecture.", share: 30 },
    { id: "team", name: "The team", description: "The people patients will meet at the front desk and beyond.", share: 20 },
    { id: "book", name: "Same-week slots", description: "Availability and pricing, kept current.", share: 10 },
  ],
};

const strategies: Strategy[] = clients.map((c, i) => ({
  clientId: c.id,
  version: [4, 7, 11, 1][i] ?? 1,
  generatedAt: subDays(today, [3, 9, 1, 0][i] ?? 0).toISOString(),
  goal: [
    "Sell out each batch drop within 48 hours by building anticipation in the week before.",
    "Grow subscriptions 15% this quarter by turning brew-tip viewers into first-bag buyers.",
    "Fill weekday 12pm and 2pm classes with intro-pack sign-ups from nearby offices.",
    "Become the first clinic local families think of for anxious patients.",
  ][i]!,
  pillars: pillarSets[c.id]!,
  cadence: c.platforms.map((p, j) => ({
    platform: p,
    perWeek: [5, 3, 4, 2][j] ?? 2,
    bestTimes: [["Tue 7:30am", "Thu 6:00pm", "Sun 10:00am"], ["Wed 12:00pm", "Sat 9:00am"], ["Mon 8:00pm", "Fri 5:30pm"]][j] ?? ["Wed 12:00pm"],
  })),
  audience: [
    { segment: "Core", note: c.brand.audience },
    { segment: "Growing", note: "Followers of similar local brands who engage with saves more than likes" },
    { segment: "Untapped", note: "People searching the category on TikTok who have never seen the brand" },
  ],
  learnings:
    i === 3
      ? []
      : [
          { id: "l1", insight: "Reels under 12 seconds hold viewers to the end", evidence: "71% completion vs 38% for longer cuts over the last 30 days", impact: "up" },
          { id: "l2", insight: "Captions that open with a question get more comments", evidence: "2.3× comment rate across 14 posts", impact: "up" },
          { id: "l3", insight: "Weekend product posts underperform", evidence: "Reach down 34% against the weekday average", impact: "down" },
          { id: "l4", insight: "Carousels drive the most saves", evidence: "Saves per post are 3.1× single images", impact: "up" },
        ],
}));

const hooks: Record<string, string[]> = {
  "kiln-and-clay": ["Pulled from the kiln at 6am", "Why this mug has a thumb rest", "48 bowls, one glaze test", "Trimming day", "The speckle is iron, not paint", "Saturday market, stall 14", "What a second looks like", "Restock: the wide planter", "Your tables, our bowls", "Glaze chemistry in 10 seconds"],
  "northbound-coffee": ["Meet the Gitesi washing station", "Your grind is too fine", "Roast day, 5:40am", "Bloom for 30 seconds. Really.", "New: Huila, pink bourbon", "The 1:16 ratio, explained", "Staff pick: the cortado", "Why we roast on Tuesdays", "Water matters more than beans", "Cold brew without the bitterness"],
  "form-pilates": ["The hundred, cued properly", "Your hip flexors after 8 hours", "Meet Anouk", "Two minutes for your upper back", "First class? Read this", "Footwork, slowly", "Lunch-break reformer", "What 'neutral spine' means", "Meet Dario", "Intro pack: 3 classes"],
  "harbour-dental": ["What a check-up actually involves", "Floss first or brush first?", "Meet Dr. Imani", "Nervous? Tell us at the desk", "Same-week appointments", "How numbing really works", "Kids' first visit", "Electric or manual?", "Meet the front desk", "Clear pricing, no surprises"],
};

const formats: PostFormat[] = ["reel", "carousel", "image", "reel", "story", "image", "carousel"];

function buildPosts(): Post[] {
  const out: Post[] = [];
  clients.forEach((client, ci) => {
    const rand = mulberry32(ci * 97 + 13);
    const pillars = pillarSets[client.id]!;
    const clientHooks = hooks[client.id]!;
    // Day offsets: negative = published, positive = upcoming.
    const offsets = client.stage === "strategy"
      ? []
      : [-26, -23, -20, -17, -14, -12, -9, -7, -5, -3, -1, 1, 2, 3, 4, 6, 7, 9, 10, 12, 14, 16];

    offsets.forEach((offset, n) => {
      const platform = client.platforms[n % client.platforms.length] as Platform;
      const format = formats[n % formats.length] as PostFormat;
      const pillar = pillars[n % pillars.length]!;
      const hook = clientHooks[n % clientHooks.length]!;
      const when = addHours(addDays(today, offset), [8, 12, 18, 10][n % 4]!);

      let status: PostStatus;
      if (offset < 0) status = "published";
      else if (n % 5 === 0) status = "in_review";
      else if (n % 7 === 0) status = "draft";
      else status = "scheduled";

      const reach = Math.round(1800 + rand() * 9000 * (format === "reel" ? 1.8 : 1));
      out.push({
        id: `${client.id}-p${n + 1}`,
        clientId: client.id,
        platform,
        format,
        pillarId: pillar.id,
        hook,
        caption: `${hook}. ${pillar.description} We keep it short because the work speaks for itself. Tell us what you'd like to see next.`,
        hashtags: [client.industry.split(" ").pop()!.toLowerCase(), pillar.id, "smallbusiness", "behindthescenes"].map((h) => `#${h}`),
        status,
        scheduledFor: offset >= 0 ? when.toISOString() : null,
        publishedAt: offset < 0 ? when.toISOString() : null,
        art: { variant: n % 4, colorIndex: n % client.brand.colors.length },
        durationSec: format === "reel" ? 8 + Math.round(rand() * 22) : undefined,
        aiNote: `Fits "${pillar.name}" (${pillar.share}% of the mix). ${format === "reel" ? "Kept under 12 seconds, because short reels are holding viewers to the end." : format === "carousel" ? "Carousel chosen because saves are 3× higher in this pillar." : "Single frame to keep the week's mix balanced."}`,
        metrics:
          offset < 0
            ? {
                reach,
                likes: Math.round(reach * (0.04 + rand() * 0.05)),
                comments: Math.round(reach * (0.004 + rand() * 0.008)),
                saves: Math.round(reach * (0.008 + rand() * 0.02)),
                shares: Math.round(reach * (0.003 + rand() * 0.008)),
              }
            : undefined,
      });
    });

    // Extra items waiting for a human, so the approval queue is never trivially small.
    const extra = client.stats.pendingApprovals;
    for (let k = 0; k < extra; k++) {
      const pillar = pillars[(k + 1) % pillars.length]!;
      const format = formats[(k + 2) % formats.length] as PostFormat;
      const hook = clientHooks[(k + 5) % clientHooks.length]!;
      out.push({
        id: `${client.id}-q${k + 1}`,
        clientId: client.id,
        platform: client.platforms[k % client.platforms.length] as Platform,
        format,
        pillarId: pillar.id,
        hook,
        caption: `${hook}. ${pillar.description} Drafted from this week's strategy. Edit anything that doesn't sound like you.`,
        hashtags: [`#${pillar.id}`, "#smallbusiness", "#local"],
        status: "in_review",
        scheduledFor: addHours(addDays(today, 5 + k * 2), 9 + k).toISOString(),
        publishedAt: null,
        art: { variant: (k + 1) % 4, colorIndex: k % client.brand.colors.length },
        durationSec: format === "reel" ? 9 + k * 2 : undefined,
        aiNote: `Fits "${pillar.name}". Scheduled for a slot where your audience has been most active over the last 4 weeks.`,
      });
    }
  });
  return out;
}

function buildAnalytics(): Analytics[] {
  return clients.map((client, ci) => {
    const rand = mulberry32(ci * 31 + 7);
    const growth = 1 + client.stats.followersDelta / 100;
    const startFollowers = client.stats.followers / growth;
    const series = Array.from({ length: 30 }, (_, d) => {
      const t = d / 29;
      const weekly = 1 + 0.25 * Math.sin((d / 7) * Math.PI * 2);
      return {
        date: subDays(today, 29 - d).toISOString(),
        reach: Math.round((client.stats.followers * 0.18 + rand() * client.stats.followers * 0.1) * weekly * (0.85 + t * 0.3)),
        engagement: +(client.stats.engagementRate * (0.8 + t * 0.2) + (rand() - 0.5) * 0.9).toFixed(2),
        followers: Math.round(startFollowers + (client.stats.followers - startFollowers) * t + (rand() - 0.5) * 30),
      };
    });
    const base = client.stats.engagementRate;
    return {
      clientId: client.id,
      series,
      byFormat: [
        { format: "reel", engagementRate: +(base * 1.45).toFixed(1), posts: 9 },
        { format: "carousel", engagementRate: +(base * 1.15).toFixed(1), posts: 6 },
        { format: "image", engagementRate: +(base * 0.8).toFixed(1), posts: 8 },
        { format: "story", engagementRate: +(base * 0.55).toFixed(1), posts: 12 },
      ],
      byPillar: pillarSets[client.id]!.map((p, k) => ({
        pillarId: p.id,
        name: p.name,
        reach: Math.round(client.stats.followers * (1.9 - k * 0.4) * (0.8 + rand() * 0.4)),
      })),
    };
  });
}

export interface SeedData {
  clients: Client[];
  strategies: Strategy[];
  posts: Post[];
  analytics: Analytics[];
}

/** A fresh, unshared copy every time, so one store never leaks into another. */
export function buildSeed(): SeedData {
  return {
    clients: structuredClone(clients),
    strategies: structuredClone(strategies),
    posts: buildPosts(),
    analytics: buildAnalytics(),
  };
}
