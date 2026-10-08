import { Hash, Mail, MessageSquare, Phone, type LucideIcon } from "lucide-react";
import type { AlertChannelKind } from "@/lib/types";

export const CHANNEL_LABEL: Record<AlertChannelKind, string> = {
  email: "Email",
  discord: "Discord",
  slack: "Slack",
  whatsapp: "WhatsApp",
};

export const CHANNEL_ICON: Record<AlertChannelKind, LucideIcon> = {
  email: Mail,
  discord: MessageSquare,
  slack: Hash,
  whatsapp: Phone,
};
