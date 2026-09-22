export const TABS = [
  { value: "brand", label: "Brand kit" },
  { value: "accounts", label: "Social accounts" },
  { value: "preferences", label: "Preferences" },
] as const;

export type Tab = (typeof TABS)[number]["value"];

/** The tab lives in the URL so other screens can link straight to "connect your accounts". */
export function resolveTab(param: string | undefined): Tab {
  return TABS.some((t) => t.value === param) ? (param as Tab) : "brand";
}
