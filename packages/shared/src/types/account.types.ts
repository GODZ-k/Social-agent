import type { z } from "zod";
import type {
  accountDetailsSchema,
  accountViewSchema,
  deviceSessionSchema,
} from "../schema/account.schema.js";

export type DeviceSession = z.infer<typeof deviceSessionSchema>;
export type AccountDetails = z.infer<typeof accountDetailsSchema>;
export type AccountView = z.infer<typeof accountViewSchema>;
