import { z } from "zod";

/** One place the person is signed in, for the account's "Where you're signed in". */
export const deviceSessionSchema = z.object({
  id: z.string(),
  device: z.string(),
  browser: z.string(),
  location: z.string(),
  lastActiveAt: z.string(),
  /** The session making the request. Exactly one session has this. */
  current: z.boolean(),
});

/** The name and email shown and edited in the account. */
export const accountDetailsSchema = z.object({
  name: z.string().trim().min(1, "Enter your name."),
  email: z.string().trim().email("Enter a valid email address."),
});

/** Everything the account needs in one response: details, password age, open sessions. */
export const accountViewSchema = z.object({
  details: accountDetailsSchema,
  passwordChangedAt: z.string(),
  sessions: z.array(deviceSessionSchema),
});
