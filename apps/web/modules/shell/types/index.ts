/** Types the app chrome uses and the API never sees. */

import type { Brand, Viewer } from "@/lib/types";
import type { WorkspaceBase } from "@/config/routes";

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

/** Everything the top bar can be handed. Which pieces it draws depends on the route. */
export type TopBarProps = {
  viewer: Viewer;
  brand?: Brand;
  brands?: Brand[];
  basePath?: WorkspaceBase;
  backTo?: { id: string; name: string };
  /** An onboarding route: the bar shows who the brand is being built for instead of a brand. */
  onboarding?: boolean;
  personName?: string;
};
