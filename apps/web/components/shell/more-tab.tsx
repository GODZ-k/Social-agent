"use client";

import { useState } from "react";
import Link from "next/link";
import { Ellipsis } from "lucide-react";
import { Sheet } from "@repo/ui/components/sheet";
import { cn } from "@/lib/utils";
import type { WorkspaceBasePath } from "@/lib/workspace-path";
import { MORE_ITEMS, navItemHref } from "./workspace-nav-items";
import { TabContent, tabClassName } from "./tab-content";

/** The places that do not fit the tab bar, in a sheet with thumb-sized rows. */
export function MoreTab({
  brandId,
  activeSegment,
  basePath = "/c",
}: {
  brandId: string;
  activeSegment: string;
  basePath?: WorkspaceBasePath;
}) {
  const [open, setOpen] = useState(false);
  const active = MORE_ITEMS.some((item) => item.segment === activeSegment);
  return (
    <>
      <button type="button" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)} className={tabClassName(active)}>
        <TabContent label="More" icon={Ellipsis} active={active} />
      </button>
      <Sheet open={open} onOpenChange={setOpen} title="More">
        <nav aria-label="More places" className="grid gap-0.5">
          {MORE_ITEMS.map(({ segment, label, icon: Icon }) => {
            const current = segment === activeSegment;
            return (
              <Link
                key={segment}
                href={navItemHref(basePath, brandId, segment)}
                onClick={() => setOpen(false)}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "flex min-h-13 items-center gap-3 rounded-[0.875rem] px-3 text-[0.9375rem] font-medium hover:bg-accent",
                  current && "bg-tint text-tint-foreground",
                )}
              >
                <Icon aria-hidden className="size-[1.125rem] text-muted-foreground" />
                {label}
              </Link>
            );
          })}
        </nav>
      </Sheet>
    </>
  );
}
