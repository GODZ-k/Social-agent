CREATE TYPE "public"."brand_scan_steps" AS ENUM('discover', 'read-pages', 'interpret', 'report');--> statement-breakpoint
CREATE TYPE "public"."brand_status" AS ENUM('active', 'archived');--> statement-breakpoint
ALTER TABLE "brand_scans" ALTER COLUMN "current_step" SET DATA TYPE "public"."brand_scan_steps" USING "current_step"::"public"."brand_scan_steps";--> statement-breakpoint
ALTER TABLE "brands" ADD COLUMN "status" "brand_status" DEFAULT 'active' NOT NULL;--> statement-breakpoint
-- Brands archived before "status" existed carry only "archived_at"; put them out of every live query.
UPDATE "brands" SET "status" = 'archived' WHERE "archived_at" IS NOT NULL;
