import { z } from "zod";

export const inviteTeammateSchema = z.object({
  name: z.string().trim().min(1, "Enter their name."),
  email: z.string().trim().toLowerCase().pipe(z.email()),
});
export type InviteTeammateValues = z.infer<typeof inviteTeammateSchema>;

export const connectSlackSchema = z.object({
  webhookUrl: z.string().trim().pipe(z.url("Enter a valid webhook URL.")),
});
export type ConnectSlackValues = z.infer<typeof connectSlackSchema>;

export const connectWhatsAppSchema = z.object({
  phoneNumber: z.string().trim().min(6, "Enter a WhatsApp Business number."),
  apiToken: z.string().trim().min(1, "Enter the API token."),
});
export type ConnectWhatsAppValues = z.infer<typeof connectWhatsAppSchema>;
