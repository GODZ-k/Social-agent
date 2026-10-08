import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { GrowthBrief } from "@social-agent/shared";
import type { ResearchView } from "@/lib/types";
import { Panel } from "@repo/ui/components/states";
import { Button } from "@repo/ui/components/button";
import { routes, workspaceRoutes } from "@/config/routes";
import type { WorkspaceBase } from "@/config/routes";

const BOTTLENECK_LABEL: Record<GrowthBrief["bottleneck"]["kind"], string> = {
  awareness: "Awareness",
  trust: "Trust",
  conversion: "Conversion",
  repeat: "Repeat customers",
  orderValue: "Order value",
};

/** The one line of "why", from the research, with a link to see all of it (S21). */
export function WhyThisPlan({
  brandId,
  research,
  basePath = routes.brand.base,
}: {
  brandId: string;
  research: ResearchView | null;
  basePath?: WorkspaceBase;
}) {
  const brief = research?.growthBrief?.content;
  if (!brief) return null;

  return (
    <Panel className="flex flex-col justify-between gap-4 shadow-none ring-1 ring-border md:flex-row md:items-center">
      <div>
        <p className="type-label">Why this plan</p>
        <p className="mt-1">
          <b>{BOTTLENECK_LABEL[brief.bottleneck.kind]} holds sales back:</b> {brief.bottleneck.why} {brief.growthLever}
        </p>
      </div>
      <Button variant="ghost" size="sm" asChild className="shrink-0">
        <Link href={workspaceRoutes(basePath).research(brandId)}>
          See the research
          <ArrowRight />
        </Link>
      </Button>
    </Panel>
  );
}
