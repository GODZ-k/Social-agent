import type { WorkspaceBasePath } from "@/lib/workspace-path";
import { WorkspaceRail } from "./workspace-rail";
import { WorkspaceTabBar } from "./workspace-tab-bar";

/** A brand workspace's places: the rail on desktop, the tab bar below 1024px. */
export function WorkspaceNav({
  clientId,
  pendingApprovals,
  basePath = "/c",
}: {
  clientId: string;
  pendingApprovals: number;
  basePath?: WorkspaceBasePath;
}) {
  return (
    <>
      <WorkspaceRail brandId={clientId} pendingApprovals={pendingApprovals} basePath={basePath} />
      <WorkspaceTabBar brandId={clientId} pendingApprovals={pendingApprovals} basePath={basePath} />
    </>
  );
}
