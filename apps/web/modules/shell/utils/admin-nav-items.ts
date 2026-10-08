import { Activity, Settings, Users } from "lucide-react";
import { routes } from "@/config/routes";

export const ADMIN_CLIENTS_PATH = routes.admin.clients.list;
export const ADMIN_SETTINGS_PATH = routes.admin.settings.root;

// Clients, Observability and Settings, the agency's three own places (ADM-7 designed and built 2026-09-28).
export const ADMIN_NAV_ITEMS = [
  { href: ADMIN_CLIENTS_PATH, label: "Clients", icon: Users },
  { href: routes.admin.observability.overview, label: "Observability", icon: Activity },
  { href: ADMIN_SETTINGS_PATH, label: "Settings", icon: Settings },
] as const;
