import "server-only";
import { cache } from "react";
import { parseISO } from "date-fns";
import type { Platform } from "@social-agent/shared";
import { getViewer } from "@/lib/auth/viewer";
import { clone } from "./clone";
import { getDb } from "./mock/db";
import * as account from "./mock/account";
import * as admin from "./mock/admin";
import * as agencySettings from "./mock/agency-settings";
import { report } from "./mock/analytics";
import { settleResearch } from "./mock/brand-flow";
import * as obs from "./mock/observability";
import * as posts from "./mock/posts";
import * as questionnaire from "./mock/questionnaire";
import * as settings from "./mock/settings";
import * as strategies from "./mock/strategy";
import type {
  AccountView,
  AdminClientRow,
  AdminClientView,
  AgencySettingsView,
  AgentRunDetail,
  Analytics,
  AnalyticsRange,
  AnalyticsReport,
  BestTimeSlot,
  BrandCard,
  CalendarMonth,
  Brand,
  FrontendErrorDetail,
  ObsAgents,
  ObsFilter,
  ObsFrontend,
  ObsOverview,
  ObsRange,
  ObsServer,
  OnboardingState,
  PostState,
  PostView,
  Preferences,
  QuestionnaireView,
  ResearchView,
  SocialAccountRow,
  Strategy,
  StrategyVersion,
  ThisWeek,
  Viewer,
} from "@/lib/types";

/**
 * Reads, called from server components. Every function is deduplicated per
 * request with React.cache, so a layout and a page asking for the same brand
 * share one lookup.
 *
 * Swapping the mock for the real API means replacing a function body with
 * `return api<Brand[]>("/brands")` and nothing above this layer changes.
 * A missing or inaccessible record is `null`, never a thrown error, so pages
 * can decide between notFound() and an empty state.
 */

/** Mirrors the API: admins reach every brand, everyone else only the brands they own. */
function canSee(viewer: Viewer, brand: Brand): boolean {
  return viewer.role === "admin" || brand.ownerId === viewer.id;
}

const canAccess = cache(async (brand: Brand) => {
  const viewer = await getViewer();
  return canSee(viewer, brand);
});

const isAdmin = cache(async () => {
  const viewer = await getViewer();
  return viewer.role === "admin";
});

const findBrand = cache(async (id: string): Promise<Brand | null> => {
  const brand = getDb().brands.find((c) => c.id === id);
  if (!brand || !(await canAccess(brand))) return null;
  return brand;
});

const reachable = cache(async (): Promise<Brand[]> => {
  const viewer = await getViewer();
  return getDb().brands.filter((c) => canSee(viewer, c));
});

/* Brands */

/** Active brands the viewer can open. Archived ones are in `listBrandCards`. */
export const listActiveBrands = cache(async (): Promise<Brand[]> => {
  const brands = await reachable();
  const active = brands.filter((c) => c.status === "active");
  return clone(active);
});

export const getBrand = cache(async (id: string): Promise<Brand | null> => {
  const brand = await findBrand(id);
  return brand && clone(brand);
});

/** "Your brands" and the brand switcher: every brand, archived ones included. */
export const listBrandCards = cache(async (): Promise<BrandCard[]> => {
  const brands = await reachable();
  const db = getDb();
  return brands.map((brand) => admin.brandCardOf(db, brand));
});

/* Onboarding */

export const getOnboarding = cache(async (brandId: string): Promise<OnboardingState | null> => {
  const brand = await findBrand(brandId);
  if (!brand) return null;
  const db = getDb();
  settleResearch(db, brand);
  return settings.onboardingOf(db, brand);
});

export const getQuestionnaire = cache(async (brandId: string): Promise<QuestionnaireView | null> => {
  if (!(await findBrand(brandId))) return null;
  const record = getDb().questionnaires[brandId];
  return record ? questionnaire.viewOf(record) : null;
});

export const getResearch = cache(async (brandId: string): Promise<ResearchView | null> => {
  const brand = await findBrand(brandId);
  if (!brand) return null;
  const db = getDb();
  const view = settleResearch(db, brand);
  return view && clone(view);
});

/* Strategy */

const findStrategy = async (brandId: string) => {
  if (!(await findBrand(brandId))) return null;
  const strategy = getDb().strategies.find((s) => s.brandId === brandId);
  return strategy ? strategies.settle(strategy) : null;
};

export const getStrategy = cache(async (brandId: string): Promise<Strategy | null> => {
  const strategy = await findStrategy(brandId);
  return strategy && clone(strategy);
});

/** Every version, newest first; each after the first carries the owner's `changeNote`. */
export const listStrategyVersions = cache(async (brandId: string): Promise<StrategyVersion[]> => {
  const strategy = await findStrategy(brandId);
  const db = getDb();
  return strategy ? strategies.versions(db, strategy) : [];
});

/* Posts */

export const listPosts = cache(async (brandId: string): Promise<PostView[]> => {
  if (!(await findBrand(brandId))) return [];
  const db = getDb();
  return posts.postsOf(db, brandId);
});

/** The content list, soonest first, filtered by state and platform. */
export const listContent = cache(async (brandId: string, state?: PostState, platform?: Platform): Promise<PostView[]> => {
  if (!(await findBrand(brandId))) return [];
  const db = getDb();
  return posts.content(db, brandId, { state, platform });
});

/** Posts waiting for approval, soonest first: the review panel and the swipe stack. */
export const listReviewQueue = cache(async (brandId: string): Promise<PostView[]> => {
  if (!(await findBrand(brandId))) return [];
  const db = getDb();
  return posts.content(db, brandId, { state: "needs_approval" });
});

export const getThisWeek = cache(async (brandId: string): Promise<ThisWeek | null> => {
  if (!(await findBrand(brandId))) return null;
  const db = getDb();
  return posts.thisWeek(db, brandId);
});

export const getPost = cache(async (postId: string): Promise<PostView | null> => {
  const db = getDb();
  const post = db.posts.find((p) => p.id === postId);
  if (!post || !(await findBrand(post.brandId))) return null;
  return posts.viewOf(db, post);
});

/** The strategy's best times on a date ("YYYY-MM-DD"), for the date and time picker. */
export const getBestTimes = cache(async (brandId: string, platform: Platform, date: string): Promise<BestTimeSlot[]> => {
  const strategy = await findStrategy(brandId);
  if (!strategy) return [];
  return posts.bestTimesOn(strategy, parseISO(date), platform);
});

/** One month ("YYYY-MM") of posts and free best times. */
export const getCalendarMonth = cache(async (brandId: string, month: string): Promise<CalendarMonth | null> => {
  if (!(await findBrand(brandId))) return null;
  await findStrategy(brandId);
  const db = getDb();
  return posts.calendarMonth(db, brandId, month);
});

/* Analytics */

export const getAnalytics = cache(async (brandId: string): Promise<Analytics | null> => {
  if (!(await findBrand(brandId))) return null;
  const analytics = getDb().analytics.find((a) => a.brandId === brandId);
  return analytics ? clone(analytics) : null;
});

export const getAnalyticsReport = cache(async (brandId: string, range: AnalyticsRange = 30): Promise<AnalyticsReport | null> => {
  const brand = await findBrand(brandId);
  if (!brand) return null;
  const db = getDb();
  const benchmark = db.research[brandId]!.benchmark;
  return report(db, brand, range, benchmark);
});

/* Account */

/** The signed-in person's own details, password age and open sessions (BA-2). */
export const getAccount = cache(async (): Promise<AccountView> => {
  const viewer = await getViewer();
  return account.accountOf(viewer);
});

/* Settings */

export const listSocialAccounts = cache(async (brandId: string): Promise<SocialAccountRow[]> => {
  const brand = await findBrand(brandId);
  const db = getDb();
  return brand ? settings.socialAccounts(db, brand) : [];
});

export const getPreferences = cache(async (brandId: string): Promise<Preferences | null> => {
  const brand = await findBrand(brandId);
  const db = getDb();
  return brand && settings.preferencesOf(db, brand);
});

/* Admin */

/** Clients (people), those who need the admin first. Empty for anyone but an admin. */
export const listAdminClients = cache(async (): Promise<AdminClientRow[]> => {
  if (!(await isAdmin())) return [];
  const db = getDb();
  const rows = db.people.map((person) => admin.rowOf(db, person));
  return rows.sort(admin.byNeedThenActivity);
});

export const getAdminClient = cache(async (clientId: string): Promise<AdminClientView | null> => {
  if (!(await isAdmin())) return null;
  const db = getDb();
  const person = db.people.find((p) => p.id === clientId);
  if (!person) return null;
  const owned = db.brands.filter((c) => c.ownerId === clientId);
  const active = owned.filter((c) => c.status === "active");
  const archived = owned.filter((c) => c.status === "archived");
  return {
    client: admin.rowOf(db, person),
    brands: clone(active),
    archivedBrands: archived.map((c) => admin.brandCardOf(db, c)),
    pendingScan: admin.pendingScanFor(clientId),
  };
});

/** Team and Notifications (ADM-7), agency-wide. Empty for anyone but an admin. */
export const getAgencySettings = cache(async (): Promise<AgencySettingsView | null> => {
  if (!(await isAdmin())) return null;
  const db = getDb();
  return {
    team: clone(db.team),
    channels: clone(db.channels),
    alerts: clone(agencySettings.alertsOf(db)),
  };
});

/* Observability (admin only, mock data) */

const noFilter: ObsFilter = { brandId: null };

export const getObsOverview = cache(async (range: ObsRange = "24h", filter: ObsFilter = noFilter): Promise<ObsOverview | null> =>
  (await isAdmin()) ? obs.overview(range, filter) : null,
);

export const getObsAgents = cache(async (range: ObsRange = "24h", filter: ObsFilter = noFilter): Promise<ObsAgents | null> =>
  (await isAdmin()) ? obs.agents(range, filter) : null,
);

export const getAgentRun = cache(async (runId: string): Promise<AgentRunDetail | null> =>
  (await isAdmin()) ? obs.runDetail(runId) : null,
);

export const getObsServer = cache(async (range: ObsRange = "24h", filter: ObsFilter = noFilter): Promise<ObsServer | null> =>
  (await isAdmin()) ? obs.server(range, filter) : null,
);

export const getObsFrontend = cache(async (range: ObsRange = "24h", filter: ObsFilter = noFilter): Promise<ObsFrontend | null> =>
  (await isAdmin()) ? obs.frontend(getDb().fixedErrors, range, filter) : null,
);

export const getFrontendError = cache(async (errorId: string): Promise<FrontendErrorDetail | null> =>
  (await isAdmin()) ? obs.frontendError(errorId, getDb().fixedErrors) : null,
);
