"use client";

import { Check } from "lucide-react";
import { workspaceHref, type WorkspaceBasePath } from "@/lib/workspace-path";
import type { SwitcherBrand } from "./switcher-brand";
import { BrandMark } from "./brand-mark";
import { HeaderMenuItem, HeaderMenuItemText } from "./header-menu";

/** One brand in a switcher. The current one is ticked; the others show what waits for approval. */
export function BrandMenuRow({
  brand,
  detail,
  current,
  basePath = "/c",
}: {
  brand: SwitcherBrand;
  detail: string;
  current: boolean;
  basePath?: WorkspaceBasePath;
}) {
  const waiting = !current && brand.pendingApprovals > 0;
  return (
    <HeaderMenuItem href={workspaceHref(basePath, brand.id)} current={current}>
      <BrandMark name={brand.name} color={brand.accent} className="size-7 text-[0.72rem] max-md:size-9 max-md:text-[0.8125rem]" />
      <HeaderMenuItemText title={brand.name} detail={detail} />
      {waiting && (
        <span className="inline-flex h-5.5 shrink-0 items-center rounded-full bg-warning/14 px-2 text-[0.6875rem] font-semibold whitespace-nowrap text-warning tabular-nums">
          {brand.pendingApprovals} to approve
        </span>
      )}
      {current && <Check aria-hidden className="text-tint-foreground!" />}
    </HeaderMenuItem>
  );
}
