"use client";

import type { WorkspaceBasePath } from "@/lib/workspace-path";
import { TAB_ITEMS, navItemHref } from "./workspace-nav-items";
import { TabBarFrame } from "./frames";
import { TabLink } from "./tab-content";
import { MoreTab } from "./more-tab";
import { useActiveSegment } from "./use-active-segment";

/** Overview, Strategy, Content, Approvals and More, below 1024px. The approvals count lives here, not in the header. */
export function WorkspaceTabBar({
  brandId,
  pendingApprovals,
  basePath = "/c",
}: {
  brandId: string;
  pendingApprovals: number;
  basePath?: WorkspaceBasePath;
}) {
  const active = useActiveSegment(brandId, basePath);
  return (
    <TabBarFrame label="Workspace">
      {TAB_ITEMS.map(({ segment, label, icon }) => (
        <TabLink
          key={segment}
          href={navItemHref(basePath, brandId, segment)}
          label={label}
          icon={icon}
          active={segment === active}
          count={segment === "approvals" ? pendingApprovals : 0}
        />
      ))}
      <MoreTab brandId={brandId} activeSegment={active} basePath={basePath} />
    </TabBarFrame>
  );
}
