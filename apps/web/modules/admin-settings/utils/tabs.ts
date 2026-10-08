import type { AgencySettingsTab } from "@/config/routes";

/** The tab names are the route's, so a settings tile's link and this list cannot drift apart. */
export const ADMIN_SETTINGS_TABS: { value: AgencySettingsTab; label: string }[] = [
  { value: "team", label: "Team" },
  { value: "notifications", label: "Notifications" },
];

/** The tab lives in the URL so a settings tile can link straight to the section it names. */
export function resolveAdminSettingsTab(param: string | undefined): AgencySettingsTab {
  return ADMIN_SETTINGS_TABS.some((t) => t.value === param) ? (param as AgencySettingsTab) : "team";
}
