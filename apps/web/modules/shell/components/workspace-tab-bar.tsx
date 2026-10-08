"use client";

import { TAB_ITEMS, navItemHref } from "@/modules/shell/utils/workspace-nav-items";
import { TabBarFrame } from "./frames";
import { TabLink } from "./tab-content";
import { MoreTab } from "./more-tab";
import { useActiveSegment } from "@/modules/shell/hooks/use-active-segment";
import { routes } from "@/config/routes";
import type { WorkspaceBase } from "@/config/routes";

/** Overview, Strategy, Content, Approvals and More, below 1024px. The approvals count lives here, not in the header. */
export function WorkspaceTabBar({
  brandId,
  pendingApprovals,
  basePath = routes.brand.base,
}: {
  brandId: string;
  pendingApprovals: number;
  basePath?: WorkspaceBase;
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
