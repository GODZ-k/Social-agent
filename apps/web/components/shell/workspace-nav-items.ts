import { CalendarDays, ChartNoAxesCombined, CircleCheckBig, Compass, House, LayoutGrid, Settings } from "lucide-react";
import { workspaceHref, type WorkspaceBasePath } from "@/lib/workspace-path";

// Ordered the way work moves through the agent: plan, make, approve, publish, learn.
export const LOOP_ITEMS = [
  { segment: "", label: "Overview", icon: House },
  { segment: "strategy", label: "Strategy", icon: Compass },
  { segment: "content", label: "Content", icon: LayoutGrid },
  { segment: "approvals", label: "Approvals", icon: CircleCheckBig },
  { segment: "calendar", label: "Calendar", icon: CalendarDays },
  { segment: "analytics", label: "Analytics", icon: ChartNoAxesCombined },
] as const;

export const SETTINGS_ITEM = { segment: "settings", label: "Settings", icon: Settings } as const;

/** The first four stay in the phone and tablet tab bar; the rest move under More. */
export const TAB_ITEMS = LOOP_ITEMS.slice(0, 4);
export const MORE_ITEMS = [...LOOP_ITEMS.slice(4), SETTINGS_ITEM];

/** A nav item's link; the Overview item has an empty segment. */
export function navItemHref(basePath: WorkspaceBasePath, brandId: string, segment: string): string {
  return workspaceHref(basePath, brandId, segment ? `/${segment}` : "");
}
