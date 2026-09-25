CREATE TYPE "public"."research_steps" AS ENUM('gather', 'diagnose', 'profile', 'save');--> statement-breakpoint
-- Every row held null or one of these ids when this ran, so the cast cannot fail.
ALTER TABLE "research_runs" ALTER COLUMN "current_step" SET DATA TYPE "public"."research_steps" USING "current_step"::"public"."research_steps";
