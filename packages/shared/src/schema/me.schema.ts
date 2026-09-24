import { z } from "zod";
import { brandSchema } from "./brand.schema.js";

export const roleSchema = z.enum(["admin", "client"]);

/** The signed-in person. `id` is our own user id, not Clerk's. */
export const meSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string().nullable(),
  imageUrl: z.string().nullable(),
  role: roleSchema,
  createdAt: z.string(),
});

/** Everything a dashboard needs for its first paint, in one response. */
export const meOverviewSchema = z.object({
  user: meSchema,
  /** The brands this person owns, newest first. An empty list means they have not onboarded yet. */
  brands: z.array(brandSchema),
  counts: z.object({ brands: z.number() }),
});
