import { index, jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import {
  DEFAULT_PREFERENCES,
  type BrandKit,
  type BusinessInfo,
  type ClientPreferences,
  type Platform,
} from "@social-agent/shared";

export const userRole = pgEnum("user_role", ["admin", "client"]);

export const loopStage = pgEnum("loop_stage", [
  "onboarding",
  "strategy",
  "content",
  "approval",
  "publishing",
  "learning",
]);

/**
 * Our own record of a person. Clerk authenticates them; ownership points here,
 * so replacing Clerk later does not touch ownership data.
 */
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email").notNull(),
  role: userRole("role").notNull().default("client"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  /** Doubles as "last synced from Clerk". */
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const clients = pgTable(
  "clients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id),
    name: text("name").notNull(),
    url: text("url").notNull(),
    industry: text("industry").notNull(),
    accent: text("accent").notNull(),
    stage: loopStage("stage").notNull().default("onboarding"),
    brand: jsonb("brand").$type<BrandKit>().notNull(),
    business: jsonb("business").$type<BusinessInfo>().notNull().default({}),
    platforms: text("platforms").array().$type<Platform[]>().notNull(),
    preferences: jsonb("preferences").$type<ClientPreferences>().notNull().default(DEFAULT_PREFERENCES),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("clients_owner_id_idx").on(table.ownerId)],
);

export type UserRow = typeof users.$inferSelect;
export type ClientRow = typeof clients.$inferSelect;
export type NewClientRow = typeof clients.$inferInsert;
