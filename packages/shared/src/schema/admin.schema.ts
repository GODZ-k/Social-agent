import { z } from "zod";
import { brandSchema } from "./brand.schema.js";

/** What an admin types to bring a client in before they have an account. */
export const inviteClientSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  name: z.string().trim().min(1).optional(),
  phone: z.string().trim().min(1).optional(),
});

/** A client (a person) as the admin sees them. */
export const adminClientSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string().nullable(),
  imageUrl: z.string().nullable(),
  phone: z.string().nullable(),
  /** `invited` until their first sign-in. */
  status: z.enum(["invited", "active"]),
  /** Archived brands are not counted. */
  brandCount: z.number(),
  createdAt: z.string(),
});

export const adminClientDetailSchema = z.object({
  client: adminClientSchema,
  brands: z.array(brandSchema),
});

export type InviteClientInput = z.infer<typeof inviteClientSchema>;
export type AdminClient = z.infer<typeof adminClientSchema>;
export type AdminClientDetail = z.infer<typeof adminClientDetailSchema>;
