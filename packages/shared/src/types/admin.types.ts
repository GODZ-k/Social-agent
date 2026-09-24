import type { z } from "zod";
import type {
  adminClientDetailSchema,
  adminClientSchema,
  inviteClientSchema,
} from "../schema/admin.schema.js";

export type InviteClientInput = z.infer<typeof inviteClientSchema>;
export type AdminClient = z.infer<typeof adminClientSchema>;
export type AdminClientDetail = z.infer<typeof adminClientDetailSchema>;
