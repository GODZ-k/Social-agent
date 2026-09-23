import { sql } from "drizzle-orm";
import {
  check,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import {
  DEFAULT_PREFERENCES,
  type ActiveHours,
  type AudienceDemographics,
  type AudienceSegment,
  type BrandKit,
  type BrandPreferences,
  type BusinessInfo,
  type CadenceEntry,
  type Platform,
  type PostArt,
  type ScanPage,
  type ScanResult,
} from "@social-agent/shared";

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () => timestamp("updated_at", { withTimezone: true }).notNull().defaultNow();

// ---------------------------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------------------------

export const userRole = pgEnum("user_role", ["admin", "client"]);

/** `invited`: an admin created the row and the person has not signed in yet. */
export const userStatus = pgEnum("user_status", ["invited", "active"]);

export const loopStage = pgEnum("loop_stage", [
  "onboarding",
  "strategy",
  "content",
  "approval",
  "publishing",
  "learning",
]);

export const brandStatus = pgEnum("brand_status", ["active", "archived"]);

/** The brand-scan workflow's step ids, in order. Mirrors `scanStepIdSchema` in `@social-agent/shared`. */
export const brandScanSteps = pgEnum("brand_scan_steps", [
  "discover",
  "read-pages",
  "interpret",
  "report",
]);

export const platform = pgEnum("platform", ["instagram", "facebook", "linkedin", "tiktok"]);

export const scanStatus = pgEnum("scan_status", ["queued", "running", "done", "failed"]);

export const strategyStatus = pgEnum("strategy_status", ["draft", "active", "superseded"]);

export const learningImpact = pgEnum("learning_impact", ["up", "down", "neutral"]);

export const postFormat = pgEnum("post_format", ["image", "carousel", "reel", "story"]);

export const postStatus = pgEnum("post_status", [
  "draft",
  "in_review",
  "approved",
  "scheduled",
  "published",
  "rejected",
]);

export const mediaType = pgEnum("media_type", ["image", "video"]);

export const mediaSource = pgEnum("media_source", ["uploaded", "generated"]);

export const socialAccountStatus = pgEnum("social_account_status", ["connected", "expired", "disconnected"]);

// ---------------------------------------------------------------------------------------------
// People and brands
// ---------------------------------------------------------------------------------------------

// users --
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkId: text("clerk_id").unique(),
    email: text("email").notNull().unique(),
    name: text("name"),
    imageUrl: text("image_url"),
    phone: text("phone"),
    role: userRole("role").notNull().default("client"),
    status: userStatus("status").notNull().default("active"),
    invitedBy: uuid("invited_by").references((): AnyPgColumn => users.id),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  () => [check("users_email_lowercase", sql`"email" = lower("email")`)],
);

// website workspace --
export const brands = pgTable(
  "brands",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    name: text("name").notNull(),
    url: text("url").notNull(),
    industry: text("industry").notNull(),
    accent: text("accent").notNull(),
    status: brandStatus("status").notNull().default("active"),
    stage: loopStage("stage").notNull().default("onboarding"),
    brand: jsonb("brand").$type<BrandKit>().notNull(),
    business: jsonb("business").$type<BusinessInfo>().notNull().default({}),
    platforms: text("platforms").array().$type<Platform[]>().notNull(),
    preferences: jsonb("preferences").$type<BrandPreferences>().notNull().default(DEFAULT_PREFERENCES),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("brands_owner_id_idx").on(table.ownerId)],
);

// ---------------------------------------------------------------------------------------------
// Onboarding and strategy
// ---------------------------------------------------------------------------------------------

/** One run of the website scan. The UI polls `status` and `current_step`. */
export const brandScans = pgTable(
  "brand_scans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    brandId: uuid("brand_id").references(() => brands.id),
    requestedBy: uuid("requested_by")
      .notNull()
      .references(() => users.id),
    url: text("url").notNull(),
    status: scanStatus("status").notNull().default("queued"),
    currentStep: brandScanSteps("current_step"),
    pages: jsonb("pages").$type<ScanPage[]>().notNull().default([]),
    result: jsonb("result").$type<ScanResult>(),
    error: text("error"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (table) => [index("brand_scans_brand_id_idx").on(table.brandId)],
);

/**
 * One row per version per brand. A version is never edited in place or deleted,
 * because posts point at the version they came from.
 */
export const strategies = pgTable(
  "strategies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    brandId: uuid("brand_id")
      .notNull()
      .references(() => brands.id),
    version: integer("version").notNull(),
    status: strategyStatus("status").notNull().default("draft"),
    goal: text("goal").notNull(),
    /** Per platform: posts per week and the best day + time slots, in the brand's timezone. */
    cadence: jsonb("cadence").$type<CadenceEntry[]>().notNull().default([]),
    audience: jsonb("audience").$type<AudienceSegment[]>().notNull().default([]),
    /** The agent's words on what changed from the previous version and why. */
    changeNote: text("change_note"),
    approvedBy: uuid("approved_by").references(() => users.id),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex("strategies_brand_version_idx").on(table.brandId, table.version),
    // A brand has at most one active strategy.
    uniqueIndex("strategies_one_active_idx").on(table.brandId).where(sql`"status" = 'active'`),
  ],
);

export const contentPillars = pgTable(
  "content_pillars",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    strategyId: uuid("strategy_id")
      .notNull()
      .references(() => strategies.id, { onDelete: "cascade" }),
    /** Stable slug such as "behind-the-scenes". Follows one pillar across strategy versions. */
    key: text("key").notNull(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    /** Share of the content mix, 0-100. */
    share: integer("share").notNull(),
    position: integer("position").notNull(),
  },
  (table) => [
    uniqueIndex("content_pillars_strategy_key_idx").on(table.strategyId, table.key),
    check("content_pillars_share_range", sql`"share" between 0 and 100`),
  ],
);

/** The agent's memory of what worked. Survives strategy rewrites. */
export const learnings = pgTable(
  "learnings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    brandId: uuid("brand_id")
      .notNull()
      .references(() => brands.id),
    observedStrategyId: uuid("observed_strategy_id")
      .notNull()
      .references(() => strategies.id),
    appliedStrategyId: uuid("applied_strategy_id").references(() => strategies.id),
    insight: text("insight").notNull(),
    /** The numbers behind the insight. */
    evidence: text("evidence").notNull(),
    impact: learningImpact("impact").notNull(),
    createdAt: createdAt(),
  },
  (table) => [index("learnings_brand_id_idx").on(table.brandId)],
);

// ---------------------------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------------------------

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    brandId: uuid("brand_id")
      .notNull()
      .references(() => brands.id),
    strategyId: uuid("strategy_id").references(() => strategies.id),
    pillarId: uuid("pillar_id").references(() => contentPillars.id),
    createdBy: uuid("created_by").references(() => users.id),
    platform: platform("platform").notNull(),
    format: postFormat("format").notNull(),
    /** Short on-image headline. */
    hook: text("hook").notNull(),
    caption: text("caption").notNull(),
    hashtags: text("hashtags").array().notNull().default([]),
    /** Why the agent made this post. Shown to the approver. */
    aiNote: text("ai_note").notNull().default(""),
    /** Seed for the artwork the UI draws while the post has no media. */
    art: jsonb("art").$type<PostArt>(),
    status: postStatus("status").notNull().default("draft"),
    scheduledFor: timestamp("scheduled_for", { withTimezone: true }),
    publishedAt: timestamp("published_at", { withTimezone: true }),

    reviewedBy: uuid("reviewed_by").references(() => users.id),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),

    rejectionReason: text("rejection_reason"),
    /** The post's id on the network. Needed to fetch its metrics. */
    externalPostId: text("external_post_id"),
    externalUrl: text("external_url"),
    /** Why the last publish attempt failed. */
    publishError: text("publish_error"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("posts_brand_status_idx").on(table.brandId, table.status),
    // The publisher looks for `scheduled` posts that are due.
    index("posts_status_scheduled_for_idx").on(table.status, table.scheduledFor),
  ],
);

/** The files of a post. The files themselves live in object storage. */
export const postMedia = pgTable(
  "post_media",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    type: mediaType("type").notNull(),
    url: text("url").notNull(),
    storageKey: text("storage_key").notNull(),
    /** Order within a carousel. */
    position: integer("position").notNull().default(0),
    source: mediaSource("source").notNull(),
    width: integer("width"),
    height: integer("height"),
    durationSec: integer("duration_sec"),
    altText: text("alt_text"),
    createdAt: createdAt(),
  },
  (table) => [index("post_media_post_id_idx").on(table.postId)],
);

// ---------------------------------------------------------------------------------------------
// Accounts and analytics
// ---------------------------------------------------------------------------------------------

/**
 * A connected social profile. The token columns are secrets: never select them
 * in a query whose result goes to a browser.
 */
export const socialAccounts = pgTable(
  "social_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    brandId: uuid("brand_id")
      .notNull()
      .references(() => brands.id),
    platform: platform("platform").notNull(),
    externalAccountId: text("external_account_id").notNull(),
    handle: text("handle").notNull(),
    avatarUrl: text("avatar_url"),
    /** AES-256-GCM. The key is in the API environment, never in the database. Null once disconnected. */
    accessTokenEnc: text("access_token_enc"),
    refreshTokenEnc: text("refresh_token_enc"),
    tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }),
    /** What the person allowed. Checked before publishing. */
    scopes: text("scopes").array().notNull().default([]),
    /** Platform-specific extras, such as the Facebook Page id behind an Instagram account. */
    meta: jsonb("meta").$type<Record<string, unknown>>().notNull().default({}),
    status: socialAccountStatus("status").notNull().default("connected"),
    connectedBy: uuid("connected_by")
      .notNull()
      .references(() => users.id),
    connectedAt: timestamp("connected_at", { withTimezone: true }).notNull().defaultNow(),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
    updatedAt: updatedAt(),
  },
  (table) => [
    // One account per platform per brand.
    uniqueIndex("social_accounts_brand_platform_idx").on(table.brandId, table.platform),
    // One real account belongs to one brand, or two brands would publish to it and count it twice.
    uniqueIndex("social_accounts_platform_external_idx").on(table.platform, table.externalAccountId),
  ],
);

/** Snapshots of a post over time. The latest row is what the UI shows; the agent reads the curve. */
export const postMetrics = pgTable(
  "post_metrics",
  {
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    capturedAt: timestamp("captured_at", { withTimezone: true }).notNull().defaultNow(),
    reach: integer("reach").notNull().default(0),
    likes: integer("likes").notNull().default(0),
    comments: integer("comments").notNull().default(0),
    saves: integer("saves").notNull().default(0),
    shares: integer("shares").notNull().default(0),
    /** Reels and TikTok. */
    views: integer("views"),
  },
  (table) => [primaryKey({ columns: [table.postId, table.capturedAt] })],
);

/** One row per social account per day. A refetch on the same day updates the row. */
export const accountMetrics = pgTable(
  "account_metrics",
  {
    socialAccountId: uuid("social_account_id")
      .notNull()
      .references(() => socialAccounts.id),
    date: date("date", { mode: "string" }).notNull(),
    followers: integer("followers").notNull(),
    reach: integer("reach").notNull().default(0),
    /** Interactions that day. The rate (engagement / reach) is calculated, never stored. */
    engagement: integer("engagement").notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.socialAccountId, table.date] })],
);

/** What the platform says about the brand's followers. One snapshot a week is enough. */
export const audienceInsights = pgTable(
  "audience_insights",
  {
    socialAccountId: uuid("social_account_id")
      .notNull()
      .references(() => socialAccounts.id),
    capturedOn: date("captured_on", { mode: "string" }).notNull(),
    /** Followers online by day and hour. Null where the platform does not offer it. */
    activeHours: jsonb("active_hours").$type<ActiveHours>(),
    demographics: jsonb("demographics").$type<AudienceDemographics>(),
  },
  (table) => [primaryKey({ columns: [table.socialAccountId, table.capturedOn] })],
);

// ---------------------------------------------------------------------------------------------
// Row types
// ---------------------------------------------------------------------------------------------

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
export type BrandRow = typeof brands.$inferSelect;
export type NewBrandRow = typeof brands.$inferInsert;
export type BrandScanRow = typeof brandScans.$inferSelect;
export type NewBrandScanRow = typeof brandScans.$inferInsert;
export type StrategyRow = typeof strategies.$inferSelect;
export type NewStrategyRow = typeof strategies.$inferInsert;
export type ContentPillarRow = typeof contentPillars.$inferSelect;
export type NewContentPillarRow = typeof contentPillars.$inferInsert;
export type LearningRow = typeof learnings.$inferSelect;
export type NewLearningRow = typeof learnings.$inferInsert;
export type PostRow = typeof posts.$inferSelect;
export type NewPostRow = typeof posts.$inferInsert;
export type PostMediaRow = typeof postMedia.$inferSelect;
export type NewPostMediaRow = typeof postMedia.$inferInsert;
export type SocialAccountRow = typeof socialAccounts.$inferSelect;
export type NewSocialAccountRow = typeof socialAccounts.$inferInsert;
export type PostMetricsRow = typeof postMetrics.$inferSelect;
export type AccountMetricsRow = typeof accountMetrics.$inferSelect;
export type AudienceInsightsRow = typeof audienceInsights.$inferSelect;
