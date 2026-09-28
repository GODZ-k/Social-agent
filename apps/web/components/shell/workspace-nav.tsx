import type { WorkspaceBasePath } from "@/lib/workspace-path";
import { WorkspaceRail } from "./workspace-rail";
import { WorkspaceTabBar } from "./workspace-tab-bar";

/** A brand workspace's places: the rail on desktop, the tab bar below 1024px. */
export function WorkspaceNav({
  brandId,
  pendingApprovals,
  basePath = "/c",
}: {
  brandId: string;
  pendingApprovals: number;
  basePath?: WorkspaceBasePath;
}) {
  return (
    <>
      <WorkspaceRail brandId={brandId} pendingApprovals={pendingApprovals} basePath={basePath} />
      <WorkspaceTabBar brandId={brandId} pendingApprovals={pendingApprovals} basePath={basePath} />
    </>
  );
}
