CREATE TYPE "public"."loop_stage" AS ENUM('onboarding', 'strategy', 'content', 'approval', 'publishing', 'learning');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'client');--> statement-breakpoint
CREATE TABLE "clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"industry" text NOT NULL,
	"accent" text NOT NULL,
	"stage" "loop_stage" DEFAULT 'onboarding' NOT NULL,
	"brand" jsonb NOT NULL,
	"business" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"platforms" text[] NOT NULL,
	"preferences" jsonb DEFAULT '{"timezone":"UTC","approvalEmails":true}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id" text NOT NULL,
	"email" text NOT NULL,
	"role" "user_role" DEFAULT 'client' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id")
);
--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "clients_owner_id_idx" ON "clients" USING btree ("owner_id");