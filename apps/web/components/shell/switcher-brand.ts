import type { Client } from "@/lib/types";

/** All a switcher row shows of a brand. Only these fields cross to the browser. */
export interface SwitcherBrand {
  id: string;
  name: string;
  /** The website, shown without the scheme: "tartinebakery.com". */
  site: string;
  accent: string;
  pendingApprovals: number;
  /** Admins only: the client who owns the brand, when known. */
  ownerName?: string;
}

function siteOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function toSwitcherBrand(client: Client, ownerName?: string): SwitcherBrand {
  return {
    id: client.id,
    name: client.name,
    site: siteOf(client.url),
    accent: client.accent,
    pendingApprovals: client.stats.pendingApprovals,
    ownerName,
  };
}
