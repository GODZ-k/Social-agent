import { z } from "zod";

export const accountDetailsSchema = z.object({
  name: z.string().trim().min(1, "Enter your name."),
  email: z.string().trim().email("Enter a valid email address."),
});
export type AccountDetailsValues = z.infer<typeof accountDetailsSchema>;
