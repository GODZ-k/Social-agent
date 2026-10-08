import type { BrandSettingsTab } from "@/config/routes";

/** The tab names are the route's, so a link from another screen and this list cannot drift apart. */
export const TABS: { value: BrandSettingsTab; label: string }[] = [
  { value: "brand", label: "Brand kit" },
  { value: "accounts", label: "Social accounts" },
  { value: "preferences", label: "Preferences" },
];

/** The tab lives in the URL so other screens can link straight to "connect your accounts". */
export function resolveTab(param: string | undefined): BrandSettingsTab {
  return TABS.some((t) => t.value === param) ? (param as BrandSettingsTab) : "brand";
}
