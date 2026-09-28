import { Activity, Users } from "lucide-react";

export const ADMIN_CLIENTS_PATH = "/admin/clients";

// Clients and Observability, the loop's two admin places. Admin settings come once designed (ADM-7).
export const ADMIN_NAV_ITEMS = [
  { href: ADMIN_CLIENTS_PATH, label: "Clients", icon: Users },
  { href: "/admin/observability", label: "Observability", icon: Activity },
] as const;
