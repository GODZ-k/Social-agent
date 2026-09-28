export const ADMIN_SETTINGS_TABS = [
  { value: "team", label: "Team" },
  { value: "notifications", label: "Notifications" },
] as const;

export type AdminSettingsTab = (typeof ADMIN_SETTINGS_TABS)[number]["value"];

/** The tab lives in the URL so a settings tile can link straight to the section it names. */
export function resolveAdminSettingsTab(param: string | undefined): AdminSettingsTab {
  return ADMIN_SETTINGS_TABS.some((t) => t.value === param) ? (param as AdminSettingsTab) : "team";
}
