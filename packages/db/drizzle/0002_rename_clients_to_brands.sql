-- The table called "clients" always held brands (a website workspace). A client is a person, in "users".
-- A rename, not drop-and-create, so existing rows are kept.
ALTER TABLE "clients" RENAME TO "brands";--> statement-breakpoint
ALTER TABLE "brands" RENAME CONSTRAINT "clients_pkey" TO "brands_pkey";--> statement-breakpoint
ALTER TABLE "brands" RENAME CONSTRAINT "clients_owner_id_users_id_fk" TO "brands_owner_id_users_id_fk";--> statement-breakpoint
ALTER INDEX "clients_owner_id_idx" RENAME TO "brands_owner_id_idx";
