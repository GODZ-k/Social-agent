import { CircleAlert } from "lucide-react";
import type { GrowthBrief } from "@social-agent/shared";
import type { ResearchView } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Panel } from "@repo/ui/components/states";
import { SourcesPanel } from "./sources-panel";

const BOTTLENECK_LABEL: Record<GrowthBrief["bottleneck"]["kind"], string> = {
  awareness: "Awareness",
  trust: "Trust",
  conversion: "Conversion",
  repeat: "Repeat customers",
  orderValue: "Order value",
};

/**
 * The growth brief and audience profile, read together: what holds sales back, who to talk to,
 * and where the brand can win. It holds only the findings, not a page title or a call to action,
 * so the research page (S21) supplies those around it. Since 2026-10-02 that page is the only
 * place the brief and the profile are shown: onboarding no longer waits for discovery.
 */
export function ResearchFindings({ research }: { research: ResearchView }) {
  const brief = research.growthBrief?.content;
  const audience = research.audienceProfile?.content;
  if (!brief || !audience) return null;

  return (
    <div className="grid grid-cols-1 gap-5 [&>*]:min-w-0">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 [&>*]:min-w-0">
        <Panel className="lg:col-span-2">
          <p className="type-label">What your posts should do</p>
          <p className="mt-1.5 font-display text-[1.5rem] leading-[1.3] tracking-[-0.01em] max-[560px]:text-[1.25rem]">{brief.growthLever}</p>
        </Panel>

        <Panel>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="type-heading">What holds sales back</h2>
              <p className="type-label">The one thing to fix first.</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/14 px-3 py-1 text-[0.8125rem] font-semibold text-warning">
            <CircleAlert className="size-4" />
            {BOTTLENECK_LABEL[brief.bottleneck.kind]}
          </span>
          <p className="mt-3">{brief.bottleneck.why}</p>
        </Panel>

        <Panel>
          <div className="mb-4 border-b border-border pb-4">
            <h2 className="type-heading">Your best customers</h2>
            <p className="type-label">Who to talk to, in their own words.</p>
          </div>
          <ul className="divide-y divide-border">
            {audience.segments.map((segment) => (
              <li key={segment.name} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{segment.name}</p>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-0.5 text-[0.75rem] font-medium",
                      segment.basis === "evidence" ? "bg-success/12 text-success" : "bg-secondary text-muted-foreground",
                    )}
                  >
                    {segment.basis === "evidence" ? "From reviews and answers" : "Our guess, to test"}
                  </span>
                </div>
                <p className="type-label mt-0.5">{segment.summary}</p>
                {segment.language[0] && (
                  <p className="mt-2 border-l-2 border-tint-strong pl-3 text-[0.9375rem]">
                    &ldquo;{segment.language[0].phrase}&rdquo; ({segment.language[0].source})
                  </p>
                )}
              </li>
            ))}
          </ul>
        </Panel>

        <Panel>
          <div className="mb-4 border-b border-border pb-4">
            <h2 className="type-heading">Brands like yours</h2>
            <p className="type-label">What they do, and the gap they leave.</p>
          </div>
          <dl className="divide-y divide-border">
            {brief.competitors.map((c) => (
              <div key={c.name} className="grid grid-cols-[7rem_minmax(0,1fr)] gap-3 py-2.5 first:pt-0 last:pb-0">
                <dt className="font-medium">{c.name}</dt>
                <dd className="type-label">{c.note}</dd>
              </div>
            ))}
          </dl>
        </Panel>

        <Panel>
          <div className="mb-3">
            <h2 className="type-heading">Where you can win</h2>
            <p className="type-label">What none of them do well.</p>
          </div>
          <p>{brief.opening}</p>
        </Panel>
      </div>

      <SourcesPanel sources={research.sources} />
    </div>
  );
}
