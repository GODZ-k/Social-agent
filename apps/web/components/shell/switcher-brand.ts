import type { Brand } from "@/lib/types";

/** All a switcher row shows of a brand. Only these fields cross to the browser. */
export interface SwitcherBrand {
  id: string;
  name: string;
  /** The website, shown without the scheme: "tartinebakery.com". */
  site: string;
  accent: string;
  pendingApprovals: number;
  /** Admins only: the brand who owns the brand, when known. */
  ownerName?: string;
}

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
