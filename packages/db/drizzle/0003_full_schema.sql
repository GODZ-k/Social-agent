CREATE TYPE "public"."learning_impact" AS ENUM('up', 'down', 'neutral');--> statement-breakpoint
CREATE TYPE "public"."media_source" AS ENUM('uploaded', 'generated');--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('image', 'video');--> statement-breakpoint
CREATE TYPE "public"."platform" AS ENUM('instagram', 'facebook', 'linkedin', 'tiktok');--> statement-breakpoint
CREATE TYPE "public"."post_format" AS ENUM('image', 'carousel', 'reel', 'story');--> statement-breakpoint
CREATE TYPE "public"."post_status" AS ENUM('draft', 'in_review', 'approved', 'scheduled', 'published', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."scan_status" AS ENUM('queued', 'running', 'done', 'failed');--> statement-breakpoint
CREATE TYPE "public"."social_account_status" AS ENUM('connected', 'expired', 'disconnected');--> statement-breakpoint
CREATE TYPE "public"."strategy_status" AS ENUM('draft', 'active', 'superseded');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('invited', 'active');--> statement-breakpoint
CREATE TABLE "account_metrics" (
	"social_account_id" uuid NOT NULL,
	"date" date NOT NULL,
	"followers" integer NOT NULL,
	"reach" integer DEFAULT 0 NOT NULL,
	"engagement" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "account_metrics_social_account_id_date_pk" PRIMARY KEY("social_account_id","date")
);
--> statement-breakpoint
CREATE TABLE "audience_insights" (
	"social_account_id" uuid NOT NULL,
	"captured_on" date NOT NULL,
	"active_hours" jsonb,
	"demographics" jsonb,
	CONSTRAINT "audience_insights_social_account_id_captured_on_pk" PRIMARY KEY("social_account_id","captured_on")
);
--> statement-breakpoint
CREATE TABLE "brand_scans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_id" uuid,
	"requested_by" uuid NOT NULL,
	"url" text NOT NULL,
	"status" "scan_status" DEFAULT 'queued' NOT NULL,
	"current_step" text,
	"pages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"result" jsonb,
	"error" text,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_pillars" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"strategy_id" uuid NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"share" integer NOT NULL,
	"position" integer NOT NULL,
	CONSTRAINT "content_pillars_share_range" CHECK ("share" between 0 and 100)
);
--> statement-breakpoint
CREATE TABLE "learnings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_id" uuid NOT NULL,
	"observed_strategy_id" uuid NOT NULL,
	"applied_strategy_id" uuid,
	"insight" text NOT NULL,
	"evidence" text NOT NULL,
	"impact" "learning_impact" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"type" "media_type" NOT NULL,
	"url" text NOT NULL,
	"storage_key" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"source" "media_source" NOT NULL,
	"width" integer,
	"height" integer,
	"duration_sec" integer,
	"alt_text" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_metrics" (
	"post_id" uuid NOT NULL,
	"captured_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reach" integer DEFAULT 0 NOT NULL,
	"likes" integer DEFAULT 0 NOT NULL,
	"comments" integer DEFAULT 0 NOT NULL,
	"saves" integer DEFAULT 0 NOT NULL,
	"shares" integer DEFAULT 0 NOT NULL,
	"views" integer,
	CONSTRAINT "post_metrics_post_id_captured_at_pk" PRIMARY KEY("post_id","captured_at")
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_id" uuid NOT NULL,
	"strategy_id" uuid,
	"pillar_id" uuid,
	"created_by" uuid,
	"platform" "platform" NOT NULL,
	"format" "post_format" NOT NULL,
	"hook" text NOT NULL,
	"caption" text NOT NULL,
	"hashtags" text[] DEFAULT '{}' NOT NULL,
	"ai_note" text DEFAULT '' NOT NULL,
	"art" jsonb,
	"status" "post_status" DEFAULT 'draft' NOT NULL,
	"scheduled_for" timestamp with time zone,
	"published_at" timestamp with time zone,
	"reviewed_by" uuid,
	"reviewed_at" timestamp with time zone,
	"rejection_reason" text,
	"external_post_id" text,
	"external_url" text,
	"publish_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "social_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_id" uuid NOT NULL,
	"platform" "platform" NOT NULL,
	"external_account_id" text NOT NULL,
	"handle" text NOT NULL,
	"avatar_url" text,
	"access_token_enc" text,
	"refresh_token_enc" text,
	"token_expires_at" timestamp with time zone,
	"scopes" text[] DEFAULT '{}' NOT NULL,
	"meta" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" "social_account_status" DEFAULT 'connected' NOT NULL,
	"connected_by" uuid NOT NULL,
	"connected_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_synced_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"status" "strategy_status" DEFAULT 'draft' NOT NULL,
	"goal" text NOT NULL,
	"cadence" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"audience" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"change_note" text,
	"approved_by" uuid,
	"approved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "clerk_id" DROP NOT NULL;--> statement-breakpoint
-- Existing brands were all set up by their owner, so back-fill before the column becomes NOT NULL.
ALTER TABLE "brands" ADD COLUMN "created_by" uuid;--> statement-breakpoint
UPDATE "brands" SET "created_by" = "owner_id";--> statement-breakpoint
ALTER TABLE "brands" ALTER COLUMN "created_by" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "brands" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "status" "user_status" DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "invited_by" uuid;--> statement-breakpoint
ALTER TABLE "account_metrics" ADD CONSTRAINT "account_metrics_social_account_id_social_accounts_id_fk" FOREIGN KEY ("social_account_id") REFERENCES "public"."social_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audience_insights" ADD CONSTRAINT "audience_insights_social_account_id_social_accounts_id_fk" FOREIGN KEY ("social_account_id") REFERENCES "public"."social_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_scans" ADD CONSTRAINT "brand_scans_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_scans" ADD CONSTRAINT "brand_scans_requested_by_users_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_pillars" ADD CONSTRAINT "content_pillars_strategy_id_strategies_id_fk" FOREIGN KEY ("strategy_id") REFERENCES "public"."strategies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learnings" ADD CONSTRAINT "learnings_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learnings" ADD CONSTRAINT "learnings_observed_strategy_id_strategies_id_fk" FOREIGN KEY ("observed_strategy_id") REFERENCES "public"."strategies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learnings" ADD CONSTRAINT "learnings_applied_strategy_id_strategies_id_fk" FOREIGN KEY ("applied_strategy_id") REFERENCES "public"."strategies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_media" ADD CONSTRAINT "post_media_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_metrics" ADD CONSTRAINT "post_metrics_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_strategy_id_strategies_id_fk" FOREIGN KEY ("strategy_id") REFERENCES "public"."strategies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_pillar_id_content_pillars_id_fk" FOREIGN KEY ("pillar_id") REFERENCES "public"."content_pillars"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_accounts" ADD CONSTRAINT "social_accounts_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_accounts" ADD CONSTRAINT "social_accounts_connected_by_users_id_fk" FOREIGN KEY ("connected_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "strategies" ADD CONSTRAINT "strategies_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "strategies" ADD CONSTRAINT "strategies_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "brand_scans_brand_id_idx" ON "brand_scans" USING btree ("brand_id");--> statement-breakpoint
CREATE UNIQUE INDEX "content_pillars_strategy_key_idx" ON "content_pillars" USING btree ("strategy_id","key");--> statement-breakpoint
CREATE INDEX "learnings_brand_id_idx" ON "learnings" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "post_media_post_id_idx" ON "post_media" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "posts_brand_status_idx" ON "posts" USING btree ("brand_id","status");--> statement-breakpoint
CREATE INDEX "posts_status_scheduled_for_idx" ON "posts" USING btree ("status","scheduled_for");--> statement-breakpoint
CREATE UNIQUE INDEX "social_accounts_brand_platform_idx" ON "social_accounts" USING btree ("brand_id","platform");--> statement-breakpoint
CREATE UNIQUE INDEX "social_accounts_platform_external_idx" ON "social_accounts" USING btree ("platform","external_account_id");--> statement-breakpoint
CREATE UNIQUE INDEX "strategies_brand_version_idx" ON "strategies" USING btree ("brand_id","version");--> statement-breakpoint
CREATE UNIQUE INDEX "strategies_one_active_idx" ON "strategies" USING btree ("brand_id") WHERE "status" = 'active';--> statement-breakpoint
ALTER TABLE "brands" ADD CONSTRAINT "brands_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
-- Emails are stored lowercase from now on. If two rows differ only by case this fails on purpose: merge them by hand first.
UPDATE "users" SET "email" = lower("email") WHERE "email" <> lower("email");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_lowercase" CHECK ("email" = lower("email"));