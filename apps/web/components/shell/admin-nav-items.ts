import { Activity, Settings, Users } from "lucide-react";

export const ADMIN_CLIENTS_PATH = "/admin/clients";
export const ADMIN_SETTINGS_PATH = "/admin/settings";

// Clients, Observability and Settings, the agency's three own places (ADM-7 designed and built 2026-09-28).
export const ADMIN_NAV_ITEMS = [
  { href: ADMIN_CLIENTS_PATH, label: "Clients", icon: Users },
  { href: "/admin/observability", label: "Observability", icon: Activity },
  { href: ADMIN_SETTINGS_PATH, label: "Settings", icon: Settings },
] as const;
