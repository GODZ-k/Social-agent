import { WorkspaceRail } from "./workspace-rail";
import { WorkspaceTabBar } from "./workspace-tab-bar";
import { routes } from "@/config/routes";
import type { WorkspaceBase } from "@/config/routes";

/** A brand workspace's places: the rail on desktop, the tab bar below 1024px. */
export function WorkspaceNav({
  brandId,
  pendingApprovals,
  basePath = routes.brand.base,
}: {
  brandId: string;
  pendingApprovals: number;
  basePath?: WorkspaceBase;
}) {
  return (
    <>
      <WorkspaceRail brandId={brandId} pendingApprovals={pendingApprovals} basePath={basePath} />
      <WorkspaceTabBar brandId={brandId} pendingApprovals={pendingApprovals} basePath={basePath} />
    </>
  );
}
