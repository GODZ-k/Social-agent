/**
 * Seed data for the server-side mock. Everything here is deterministic, with
 * dates generated relative to "now" so the calendar and charts are always
 * populated. Only `lib/api/mock/db.ts` may import this file.
 */
import { addDays, addHours, addMinutes, startOfDay, subDays, subMinutes } from "date-fns";
import type { ConnectError, Language, Platform, PostFormat, PostStatus } from "@social-agent/shared";
import type { Analytics, Client, Learning, Post, Strategy, StrategyVersion } from "@/lib/types";
import { buildPeople, failedScans, OWNERS, type FailedScan, type MockPerson } from "./seed-people";
import { buildQuestionnaires, type QuestionnaireRecord } from "./questionnaire";
import { buildResearch, type ResearchRecord } from "./research";
import { AUTO_START_MINUTES } from "./strategy";

export function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const now = new Date();
const today = startOfDay(now);

export const handleFor = (name: string) => "@" + name.toLowerCase().replace(/[^a-z0-9]+/g, "");

type ClientSeed = Omit<Client, "accounts" | "preferences" | "status" | "business"> &
  Partial<Pick<Client, "status" | "business">> & {
    connected: Platform[];
    expired?: Platform[];
    timezone: string;
  };

const seedClients: ClientSeed[] = [
  {
    id: "kiln-and-clay",
    ownerId: OWNERS.priya,
    name: "Kiln & Clay",
    url: "https://kilnandclay.studio",
    industry: "Handmade ceramics",
    accent: "#B4532A",
    stage: "approval",
    platforms: ["instagram", "facebook", "tiktok"],
    connected: ["instagram", "facebook", "tiktok"],
    timezone: "Europe/London",
    createdAt: subDays(today, 64).toISOString(),
    business: {
      email: "hello@kilnandclay.studio",
      location: { city: "Bristol", country: "United Kingdom" },
      hours: [
        { day: "sat", open: "09:00", close: "15:00" },
        { day: "sun", open: "10:00", close: "14:00" },
      ],
    },
    brand: {
      tagline: "Tableware thrown by hand in small batches",
      summary:
        "A two-person pottery studio selling stoneware mugs, bowls and planters online and at weekend markets. The site leans on process photography and a calm, tactile tone.",
      audience: "Home cooks and gift buyers, 27–45, who value craft over convenience",
      voice: ["Warm", "Unhurried", "Hands-on", "Plain-spoken"],
      colors: [
        { name: "Fired clay", hex: "#B4532A" },
        { name: "Slip", hex: "#E9DFD0" },
        { name: "Glaze", hex: "#2F5D62" },
        { name: "Kiln ash", hex: "#3A3633" },
      ],
      fonts: { heading: "Fraunces", body: "Karla" },
      aesthetic: "Earthy, close-up, natural light",
      keywords: ["stoneware", "handmade mugs", "small batch"],
    },
    stats: { followers: 18420, followersDelta: 6.2, engagementRate: 5.4, engagementDelta: 0.8, scheduled: 0, pendingApprovals: 0 },
  },
  {
    id: "northbound-coffee",
    ownerId: OWNERS.sam,
    name: "Northbound Coffee",
    url: "https://northbound.coffee",
    industry: "Specialty coffee roaster",
    accent: "#1F6F54",
    stage: "publishing",
    platforms: ["instagram", "tiktok"],
    connected: ["instagram"],
    expired: ["tiktok"],
    timezone: "America/Los_Angeles",
    createdAt: subDays(today, 121).toISOString(),
    business: {
      phone: "+1 415 555 0190",
      email: "beans@northbound.coffee",
      location: { address: "375 Valencia St", city: "San Francisco", region: "CA", country: "United States" },
      hours: (["mon", "tue", "wed", "thu", "fri"] as const).map((day) => ({ day, open: "07:00", close: "16:00" })),
    },
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
    stats: { followers: 42960, followersDelta: 3.1, engagementRate: 4.1, engagementDelta: -0.3, scheduled: 0, pendingApprovals: 0 },
  },
  {
    id: "form-pilates",
    ownerId: OWNERS.lucy,
    name: "Form Pilates",
    url: "https://formpilates.co",
    industry: "Boutique fitness studio",
    accent: "#7A4FD6",
    stage: "learning",
    platforms: ["instagram", "facebook"],
    connected: ["instagram"],
    timezone: "Europe/London",
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
    stats: { followers: 9870, followersDelta: 11.4, engagementRate: 6.8, engagementDelta: 1.9, scheduled: 0, pendingApprovals: 0 },
  },
  {
    id: "harbour-dental",
    ownerId: OWNERS.lucy,
    name: "Harbour Dental",
    url: "https://harbourdental.clinic",
    industry: "Family dental clinic",
    accent: "#1B76C9",
    stage: "content",
    platforms: ["instagram", "facebook", "linkedin"],
    connected: ["instagram", "facebook"],
    timezone: "Europe/London",
    createdAt: subDays(today, 9).toISOString(),
    business: {
      phone: "+44 117 496 0321",
      location: { address: "12 Quay Street", city: "Bristol", country: "United Kingdom" },
    },
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
    stats: { followers: 2140, followersDelta: 2.4, engagementRate: 3.2, engagementDelta: 0, scheduled: 0, pendingApprovals: 0 },
  },
  {
    id: "tartine-bakery",
    ownerId: OWNERS.hannah,
    name: "Tartine Bakery",
    url: "https://tartinebakery.com",
    industry: "Bakery and café",
    accent: "#C2873D",
    stage: "content",
    platforms: ["instagram", "facebook"],
    connected: ["facebook"],
    timezone: "America/Los_Angeles",
    createdAt: subDays(today, 1).toISOString(),
    business: {
      location: { address: "600 Guerrero St", city: "San Francisco", region: "CA", country: "United States" },
      hours: (["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const).map((day) => ({ day, open: "08:00", close: "17:00" })),
    },
    brand: {
      tagline: "Country bread, morning buns and a long queue worth joining",
      summary:
        "A Mission District bakery known for its country loaf and morning buns, with a café and a cookbook shelf. The site is sparse, photo-led and quietly confident.",
      audience: "Neighbourhood regulars and food travellers, 25–55, who plan trips around what they eat",
      voice: ["Quietly confident", "Craft-first", "Warm"],
      colors: [
        { name: "Crust", hex: "#C2873D" },
        { name: "Flour", hex: "#F7F1E6" },
        { name: "Char", hex: "#2A211B" },
        { name: "Butter", hex: "#EFC96B" },
      ],
      fonts: { heading: "Cormorant Garamond", body: "Work Sans" },
    },
    stats: { followers: 1202, followersDelta: 0, engagementRate: 0, engagementDelta: 0, scheduled: 0, pendingApprovals: 0 },
  },
  {
    id: "meow-meow-tweet",
    ownerId: OWNERS.priya,
    name: "Meow Meow Tweet",
    url: "https://meowmeowtweet.com",
    industry: "Natural skincare",
    accent: "#E06C4F",
    stage: "onboarding",
    platforms: ["instagram", "facebook"],
    connected: [],
    timezone: "America/New_York",
    createdAt: today.toISOString(),
    brand: {
      tagline: "Vegan skincare with a sense of humour",
      summary:
        "A small Brooklyn studio making plastic-free deodorants, soaps and balms by hand. The site is playful, illustrated and explicit about every ingredient.",
      audience: "Ingredient-checkers with sensitive skin, 25–40, and small natural-goods shops",
      voice: ["Playful", "Honest", "Kind"],
      colors: [
        { name: "Tomato", hex: "#E06C4F" },
        { name: "Paper", hex: "#FBF6EE" },
        { name: "Ink", hex: "#26221F" },
        { name: "Sage", hex: "#8FAE8B" },
      ],
      fonts: { heading: "Recoleta", body: "Nunito Sans" },
    },
    stats: { followers: 0, followersDelta: 0, engagementRate: 0, engagementDelta: 0, scheduled: 0, pendingApprovals: 0 },
  },
  {
    id: "don-angie",
    ownerId: OWNERS.marco,
    name: "Don Angie",
    url: "https://donangie.com",
    industry: "Italian-American restaurant",
    accent: "#A3242B",
    stage: "onboarding",
    platforms: ["instagram"],
    connected: ["instagram"],
    timezone: "America/New_York",
    createdAt: subDays(today, 3).toISOString(),
    brand: {
      tagline: "Italian-American, pinwheeled",
      summary:
        "A West Village restaurant famous for its pinwheel lasagna and hard-to-get tables. The site is minimal: reservations, the menu and press.",
      audience: "New Yorkers and visitors, 25–50, who book a table weeks ahead",
      voice: ["Bold", "Playful", "Generous"],
      colors: [
        { name: "Sauce", hex: "#A3242B" },
        { name: "Linen", hex: "#F5EFE6" },
        { name: "Espresso", hex: "#231A17" },
        { name: "Basil", hex: "#3F7D4E" },
      ],
      fonts: { heading: "Playfair Display", body: "Inter" },
    },
    stats: { followers: 0, followersDelta: 0, engagementRate: 0, engagementDelta: 0, scheduled: 0, pendingApprovals: 0 },
  },
  {
    id: "whisker-wash",
    ownerId: OWNERS.priya,
    name: "Whisker Wash",
    url: "https://whiskerwash.com",
    industry: "Pet grooming",
    accent: "#3C8DAD",
    status: "archived",
    stage: "onboarding",
    platforms: ["instagram"],
    connected: [],
    timezone: "America/New_York",
    createdAt: subDays(today, 40).toISOString(),
    brand: {
      tagline: "Gentle grooming, no rush",
      summary: "A mobile pet grooming van. Archived by its owner before strategy.",
      audience: "Pet owners within 5 miles",
      voice: ["Friendly"],
      colors: [
        { name: "Bath", hex: "#3C8DAD" },
        { name: "Foam", hex: "#F1F8FB" },
      ],
      fonts: { heading: "Inter", body: "Inter" },
    },
    stats: { followers: 0, followersDelta: 0, engagementRate: 0, engagementDelta: 0, scheduled: 0, pendingApprovals: 0 },
  },
];

const clients: Client[] = seedClients.map(({ connected, expired = [], timezone, ...client }) => ({
  ...client,
  status: client.status ?? "active",
  business: client.business ?? {},
  accounts: [...connected, ...expired].map((platform) => ({
    platform,
    handle: handleFor(client.name),
    status: expired.includes(platform) ? ("expired" as const) : ("connected" as const),
    connectedAt: client.createdAt,
  })),
  preferences: { timezone, approvalEmails: true, chatLanguage: "en" },
}));

/** Per-brand onboarding and connection details the Brand record does not carry. */
export interface BrandExtras {
  connectSkipped: boolean;
  connectErrors: Partial<Record<Platform, ConnectError>>;
  /** When each connected account's access runs out. */
  accessExpiresAt: Partial<Record<Platform, string>>;
  postLanguage: Language;
  /** Set when an admin sent the client a link to connect their own accounts (2026-09-28). */
  connectLinkSentAt?: string;
}

function extrasFor(client: Client): BrandExtras {
  const accessExpiresAt: Partial<Record<Platform, string>> = {};
  client.accounts.forEach((account, k) => {
    const expiry = account.status === "expired" ? subDays(today, 3) : addDays(today, 18 + k * 11);
    accessExpiresAt[account.platform] = expiry.toISOString();
  });
  return {
    connectSkipped: client.id === "tartine-bakery" || client.id === "meow-meow-tweet",
    connectErrors: client.id === "form-pilates" ? { facebook: "missing_scopes" } : {},
    accessExpiresAt,
    postLanguage: client.id === "meow-meow-tweet" ? "hinglish" : "en",
  };
}

export const pillarSets: Record<string, Strategy["pillars"]> = {
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
  "tartine-bakery": [
    { id: "oven", name: "Out of the oven", description: "The first bake of the day, shown as it happens.", share: 40 },
    { id: "craft", name: "How it's made", description: "Levain, lamination and the long ferment, one step at a time.", share: 30 },
    { id: "table", name: "At the table", description: "Regulars, queues and what people order.", share: 20 },
    { id: "news", name: "This week", description: "Specials, sell-outs and opening hours.", share: 10 },
  ],
};

interface StrategySeed {
  version: number;
  status: Strategy["status"];
  /** Minutes before now that this version was drafted. */
  draftedMinutesAgo: number;
  /** Who pressed "Start now"; null when it started on its own. */
  approvedBy: string | null;
  goal: string;
  changeNote: string | null;
  history: { version: number; draftedDaysAgo: number; approvedBy: string | null; changeNote: string | null }[];
}

const DAY = 24 * 60;

const strategySeeds: Record<string, StrategySeed> = {
  "kiln-and-clay": {
    version: 4,
    status: "active",
    draftedMinutesAgo: 3 * DAY,
    approvedBy: OWNERS.priya,
    goal: "Sell out each batch drop within 48 hours by building anticipation in the week before.",
    changeNote: "More behind-the-scenes at the wheel, fewer product shots",
    history: [
      { version: 3, draftedDaysAgo: 24, approvedBy: null, changeNote: null },
      { version: 2, draftedDaysAgo: 45, approvedBy: OWNERS.priya, changeNote: "Post on TikTok too" },
      { version: 1, draftedDaysAgo: 63, approvedBy: OWNERS.priya, changeNote: null },
    ],
  },
  "northbound-coffee": {
    version: 7,
    status: "active",
    draftedMinutesAgo: 9 * DAY,
    approvedBy: null,
    goal: "Grow subscriptions 15% this quarter by turning brew-tip viewers into first-bag buyers.",
    changeNote: null,
    history: [
      { version: 6, draftedDaysAgo: 30, approvedBy: OWNERS.sam, changeNote: "Keep the café posts to one a week" },
      { version: 5, draftedDaysAgo: 52, approvedBy: null, changeNote: null },
    ],
  },
  "form-pilates": {
    version: 11,
    status: "active",
    draftedMinutesAgo: 1 * DAY,
    approvedBy: OWNERS.lucy,
    goal: "Fill weekday 12pm and 2pm classes with intro-pack sign-ups from nearby offices.",
    changeNote: "Talk to office workers, not athletes",
    history: [
      { version: 10, draftedDaysAgo: 28, approvedBy: null, changeNote: null },
      { version: 9, draftedDaysAgo: 57, approvedBy: OWNERS.lucy, changeNote: "Show all three studios" },
    ],
  },
  "harbour-dental": {
    version: 1,
    status: "active",
    draftedMinutesAgo: 8 * DAY,
    approvedBy: null,
    goal: "Become the first clinic local families think of for anxious patients.",
    changeNote: null,
    history: [],
  },
  "tartine-bakery": {
    version: 1,
    status: "draft",
    draftedMinutesAgo: 12,
    approvedBy: null,
    goal: "Turn the queue outside into pre-orders and bring weekday regulars in before 10am.",
    changeNote: null,
    history: [],
  },
};

const learningsFor = (clientId: string): Learning[] =>
  clientId === "harbour-dental" || clientId === "tartine-bakery"
    ? []
    : [
        { id: "l1", insight: "Reels under 12 seconds hold viewers to the end", evidence: "71% completion vs 38% for longer cuts over the last 30 days", impact: "up", change: "Next month's reels are cut to 8–12 seconds." },
        { id: "l2", insight: "Captions that open with a question get more comments", evidence: "2.3× comment rate across 14 posts", impact: "up", change: "Two in three captions now open with a question." },
        { id: "l3", insight: "Weekend product posts underperform", evidence: "Reach down 34% against the weekday average", impact: "down", change: "Product posts move to Tuesday and Thursday mornings." },
        { id: "l4", insight: "Carousels drive the most saves", evidence: "Saves per post are 3.1× single images", impact: "up", change: "One extra carousel a week, taken from image posts." },
        { id: "l5", insight: "Posting time made little difference on Facebook", evidence: "Reach within 5% across morning and evening slots", impact: "neutral", change: "Facebook keeps its current times." },
      ];

const BEST_TIMES = [["Tue 7:30am", "Thu 6:00pm", "Sun 10:00am"], ["Wed 12:00pm", "Sat 9:00am"], ["Mon 8:00pm", "Fri 5:30pm"]];

/** A version someone started was started 9 minutes after drafting; otherwise it started on its own. */
function activatedAtOf(generatedAt: Date, approvedBy: string | null): Date {
  const minutes = approvedBy ? 9 : AUTO_START_MINUTES;
  return addMinutes(generatedAt, minutes);
}

function buildStrategy(client: Client): Strategy | null {
  const seed = strategySeeds[client.id];
  if (!seed) return null;
  const generatedAt = subMinutes(now, seed.draftedMinutesAgo);
  const autoStartsAt = addMinutes(generatedAt, AUTO_START_MINUTES);
  const activatedAt = seed.status === "active" ? activatedAtOf(generatedAt, seed.approvedBy).toISOString() : null;
  return {
    clientId: client.id,
    version: seed.version,
    status: seed.status,
    generatedAt: generatedAt.toISOString(),
    autoStartsAt: autoStartsAt.toISOString(),
    activatedAt,
    approvedBy: seed.approvedBy,
    changeNote: seed.changeNote,
    goal: seed.goal,
    pillars: pillarSets[client.id]!,
    cadence: client.platforms.map((platform, j) => ({
      platform,
      perWeek: [5, 3, 4, 2][j] ?? 2,
      bestTimes: BEST_TIMES[j] ?? ["Wed 12:00pm"],
    })),
    audience: [
      { segment: "Core", note: client.brand.audience },
      { segment: "Growing", note: "Followers of similar local brands who engage with saves more than likes" },
      { segment: "Untapped", note: "People searching the category on TikTok who have never seen the brand" },
    ],
    learnings: learningsFor(client.id),
  };
}

function buildHistory(clientId: string): StrategyVersion[] {
  const seed = strategySeeds[clientId];
  if (!seed) return [];
  return seed.history.map((h) => {
    const generatedAt = subDays(now, h.draftedDaysAgo);
    return {
      version: h.version,
      status: "superseded",
      generatedAt: generatedAt.toISOString(),
      activatedAt: activatedAtOf(generatedAt, h.approvedBy).toISOString(),
      approvedBy: h.approvedBy,
      changeNote: h.changeNote,
    };
  });
}

const hooks: Record<string, string[]> = {
  "kiln-and-clay": ["Pulled from the kiln at 6am", "Why this mug has a thumb rest", "48 bowls, one glaze test", "Trimming day", "The speckle is iron, not paint", "Saturday market, stall 14", "What a second looks like", "Restock: the wide planter", "Your tables, our bowls", "Glaze chemistry in 10 seconds"],
  "northbound-coffee": ["Meet the Gitesi washing station", "Your grind is too fine", "Roast day, 5:40am", "Bloom for 30 seconds. Really.", "New: Huila, pink bourbon", "The 1:16 ratio, explained", "Staff pick: the cortado", "Why we roast on Tuesdays", "Water matters more than beans", "Cold brew without the bitterness"],
  "form-pilates": ["The hundred, cued properly", "Your hip flexors after 8 hours", "Meet Anouk", "Two minutes for your upper back", "First class? Read this", "Footwork, slowly", "Lunch-break reformer", "What 'neutral spine' means", "Meet Dario", "Intro pack: 3 classes"],
  "harbour-dental": ["What a check-up actually involves", "Floss first or brush first?", "Meet Dr. Imani", "Nervous? Tell us at the desk", "Same-week appointments", "How numbing really works", "Kids' first visit", "Electric or manual?", "Meet the front desk", "Clear pricing, no surprises"],
  "tartine-bakery": ["Out of the oven at 6am", "Why the crust cracks like that", "Levain, fed twice a day", "The queue by 8am", "What's left by noon", "Morning buns, first batch", "The loaf that sells out first", "Butter, not margarine, always", "Saturday market table", "This week: what's new"],
};

const FULL_MONTH = [-26, -23, -20, -17, -14, -12, -9, -7, -5, -3, -1, 1, 2, 3, 4, 6, 7, 9, 10, 12, 14, 16];

/** Day offsets per brand: negative went out, positive is upcoming. Brands without a plan have no posts. */
const postPlans: Record<string, { offsets: number[]; waiting: number }> = {
  "kiln-and-clay": { offsets: FULL_MONTH, waiting: 5 },
  "northbound-coffee": { offsets: FULL_MONTH, waiting: 2 },
  "form-pilates": { offsets: FULL_MONTH, waiting: 0 },
  "harbour-dental": { offsets: [-6, -5, -3, -2, -1, 1, 2, 3, 5, 6, 8, 9], waiting: 3 },
  // Day-1 brand with a draft strategy: no history yet, only what the first draft queued.
  "tartine-bakery": { offsets: [2, 5], waiting: 4 },
};

/** Posts the network refused, so the "failed" state has data: brand id and the post index. */
const FAILED_POSTS: Record<string, { index: number; reason: string }> = {
  "kiln-and-clay": { index: 10, reason: "Instagram refused the video: it is longer than 90 seconds for a story." },
  "northbound-coffee": { index: 9, reason: "TikTok access expired before the post went out." },
};

const formats: PostFormat[] = ["reel", "carousel", "image", "reel", "story", "image", "carousel"];

function aiNoteFor(pillar: Strategy["pillars"][number], format: PostFormat) {
  if (format === "reel") return `Fits "${pillar.name}" (${pillar.share}% of the mix). Kept under 12 seconds, because short reels are holding viewers to the end.`;
  if (format === "carousel") return `Fits "${pillar.name}" (${pillar.share}% of the mix). Carousel chosen because saves are 3× higher in this pillar.`;
  return `Fits "${pillar.name}" (${pillar.share}% of the mix). Single frame to keep the week's mix balanced.`;
}

function statusFor(offset: number, n: number): PostStatus {
  if (offset < 0) return "published";
  if (n % 5 === 0) return "in_review";
  if (n % 7 === 0) return "draft";
  return "scheduled";
}

function buildPosts(): Post[] {
  const out: Post[] = [];
  clients.forEach((client, ci) => {
    const plan = postPlans[client.id];
    if (!plan) return;
    const rand = mulberry32(ci * 97 + 13);
    const pillars = pillarSets[client.id]!;
    const clientHooks = hooks[client.id]!;
    const failed = FAILED_POSTS[client.id];

    plan.offsets.forEach((offset, n) => {
      const platform = client.platforms[n % client.platforms.length] as Platform;
      const format = formats[n % formats.length] as PostFormat;
      const pillar = pillars[n % pillars.length]!;
      const hook = clientHooks[n % clientHooks.length]!;
      const when = addHours(addDays(today, offset), [8, 12, 18, 10][n % 4]!);
      const isFailed = failed?.index === n;
      const status = isFailed ? "scheduled" : statusFor(offset, n);
      const decided = status === "published" || status === "scheduled";
      const reach = Math.round((client.stats.followers * 0.08 + 800 + rand() * 4000) * (format === "reel" ? 1.8 : 1));

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
        scheduledFor: offset >= 0 || isFailed ? when.toISOString() : null,
        publishedAt: offset < 0 && !isFailed ? when.toISOString() : null,
        art: { variant: n % 4, colorIndex: n % client.brand.colors.length },
        durationSec: format === "reel" ? 8 + Math.round(rand() * 22) : undefined,
        slides: format === "carousel" ? 3 + (n % 5) : undefined,
        aiNote: aiNoteFor(pillar, format),
        approval: decided ? { at: subDays(when, 2).toISOString(), byAgency: n % 3 === 0 } : null,
        failure: isFailed ? { reason: failed.reason, at: addMinutes(when, 1).toISOString() } : null,
        metrics:
          offset < 0 && !isFailed
            ? {
                reach,
                likes: Math.round(reach * (0.04 + rand() * 0.05)),
                comments: Math.round(reach * (0.004 + rand() * 0.008)),
                saves: Math.round(reach * (0.008 + rand() * 0.03)),
                shares: Math.round(reach * (0.003 + rand() * 0.008)),
                follows: Math.round(reach * (0.002 + rand() * 0.006)),
              }
            : undefined,
      });
    });

    // Extra items waiting for a human, so the approval queue is never trivially small.
    for (let k = 0; k < plan.waiting; k++) {
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
        slides: format === "carousel" ? 4 + k : undefined,
        aiNote: `Fits "${pillar.name}". Scheduled for a slot where your audience has been most active over the last 4 weeks.`,
        approval: null,
      });
    }
  });
  return out;
}

function buildAnalytics(): Analytics[] {
  return clients.map((client, ci) => {
    const pillars = pillarSets[client.id];
    if (!postPlans[client.id] || !pillars) return { clientId: client.id, series: [], byFormat: [], byPillar: [] };
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
      byPillar: pillars.map((p, k) => ({
        pillarId: p.id,
        name: p.name,
        reach: Math.round(client.stats.followers * (1.9 - k * 0.4) * (0.8 + rand() * 0.4)),
      })),
    };
  });
}

/** A post's state before a decision, so the decision can be undone. */
export type DecisionSnapshot = Pick<Post, "status" | "approval" | "rejectReason" | "changeRequest">;

export interface SeedData {
  clients: Client[];
  strategies: Strategy[];
  /** Older strategy versions per brand, newest first. */
  strategyHistory: Record<string, StrategyVersion[]>;
  posts: Post[];
  analytics: Analytics[];
  extras: Record<string, BrandExtras>;
  questionnaires: Record<string, QuestionnaireRecord>;
  research: Record<string, ResearchRecord>;
  people: MockPerson[];
  failedScans: FailedScan[];
  /** Keyed by post id: the state before the last decision. */
  decisions: Record<string, DecisionSnapshot>;
  /** Frontend error ids marked as fixed on the observability screen. */
  fixedErrors: string[];
}

/** A fresh, unshared copy every time, so one store never leaks into another. */
export function buildSeed(): SeedData {
  const strategies = clients.map(buildStrategy).filter((s): s is Strategy => s !== null);
  return {
    clients: structuredClone(clients),
    strategies,
    strategyHistory: Object.fromEntries(clients.map((c) => [c.id, buildHistory(c.id)])),
    posts: buildPosts(),
    analytics: buildAnalytics(),
    extras: Object.fromEntries(clients.map((c) => [c.id, extrasFor(c)])),
    questionnaires: buildQuestionnaires(clients),
    research: buildResearch(clients),
    people: buildPeople(),
    failedScans: structuredClone(failedScans),
    decisions: {},
    fixedErrors: [],
  };
}

/** Defaults for a brand made after the seed: nothing connected, English posts. */
export function newBrandExtras(): BrandExtras {
  return { connectSkipped: false, connectErrors: {}, accessExpiresAt: {}, postLanguage: "en" };
}
