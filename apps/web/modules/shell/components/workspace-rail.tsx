"use client";

import { LOOP_ITEMS, SETTINGS_ITEM, navItemHref } from "@/modules/shell/utils/workspace-nav-items";
import { RailFrame } from "./frames";
import { RailLink } from "./rail-link";
import { useActiveSegment } from "@/modules/shell/hooks/use-active-segment";
import { routes } from "@/config/routes";
import type { WorkspaceBase } from "@/config/routes";

/** The workspace's places on desktop. Settings is not a step in the loop, so it sits apart. */
export function WorkspaceRail({
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
    <RailFrame label="Workspace">
      {LOOP_ITEMS.map(({ segment, label, icon }) => (
        <RailLink
          key={segment}
          href={navItemHref(basePath, brandId, segment)}
          label={label}
          icon={icon}
          active={segment === active}
          count={segment === "approvals" ? pendingApprovals : 0}
        />
      ))}
      <span className="mx-2 my-1.5 h-px bg-border" aria-hidden />
      <RailLink
        href={navItemHref(basePath, brandId, SETTINGS_ITEM.segment)}
        label={SETTINGS_ITEM.label}
        icon={SETTINGS_ITEM.icon}
        active={active === SETTINGS_ITEM.segment}
      />
    </RailFrame>
  );
}
