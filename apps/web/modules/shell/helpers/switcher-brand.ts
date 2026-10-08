import type { Brand } from "@/lib/types";
import type { SwitcherBrand } from "@/modules/shell/types";

function siteOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function toSwitcherBrand(brand: Brand, ownerName?: string): SwitcherBrand {
  return {
    id: brand.id,
    name: brand.name,
    site: siteOf(brand.url),
    accent: brand.accent,
    pendingApprovals: brand.stats.pendingApprovals,
    ownerName,
  };
}
