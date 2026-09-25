-- "Intake" became "questionnaire" (2026-09-25). A rename keeps every row and value.
ALTER TABLE "brands" RENAME COLUMN "intake" TO "questionnaire";--> statement-breakpoint
ALTER TABLE "brands" RENAME COLUMN "intake_session" TO "questionnaire_session";--> statement-breakpoint
ALTER TABLE "brands" RENAME COLUMN "intake_approved_at" TO "questionnaire_approved_at";
