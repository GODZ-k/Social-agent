import type { z } from "zod";
import type {
  meOverviewSchema,
  meSchema,
  roleSchema,
} from "../schema/me.schema.js";

export type Role = z.infer<typeof roleSchema>;
export type Me = z.infer<typeof meSchema>;
export type MeOverview = z.infer<typeof meOverviewSchema>;
