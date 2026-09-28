import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { BrandKit } from "@social-agent/shared";
import { workspaceHref, type WorkspaceBasePath } from "@/lib/workspace-path";
import { Panel } from "@repo/ui/components/states";

export function BrandKitSummary({
  brand,
  clientId,
  basePath = "/c",
}: {
  brand: BrandKit;
  clientId: string;
  basePath?: WorkspaceBasePath;
}) {
  return (
    <Panel aria-labelledby="brand-heading">
      <h2 id="brand-heading" className="type-heading">Brand kit</h2>
      <p className="type-label mt-1 mb-5">What every post starts from.</p>
      <div className="grid gap-7 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <p className="max-w-[62ch]">{brand.summary}</p>
          <div className="mt-5 grid grid-cols-2 gap-4">
            <div>
              <p className="type-label">Written for</p>
              <p className="mt-1">{brand.audience}</p>
            </div>
            <div>
              <p className="type-label">Sounds</p>
              <ul className="mt-1.5 flex flex-wrap gap-1.5">
                {brand.voice.map((v) => (
                  <li key={v} className="rounded-full bg-secondary px-2.5 py-1 text-[0.8125rem] font-medium text-foreground">{v}</li>
                ))}
              </ul>
            </div>
          </div>
          <p className="mt-5">
            <Link href={workspaceHref(basePath, clientId, "/settings?tab=brand")} className="inline-flex items-center gap-0.5 font-medium text-tint-foreground hover:underline">
              Edit the brand kit <ChevronRight className="size-3.5" />
            </Link>
          </p>
        </div>
        <div>
          <ul className="flex overflow-hidden rounded-lg ring-1 ring-border">
            {brand.colors.map((c) => (
              <li key={c.hex} className="h-16 flex-1" style={{ background: c.hex }} title={`${c.name} ${c.hex}`} />
            ))}
          </ul>
          <p className="type-label mt-3">
            {brand.fonts.heading === brand.fonts.body
              ? brand.fonts.heading
              : `${brand.fonts.heading} for headings, ${brand.fonts.body} for text`}
          </p>
        </div>
      </div>
    </Panel>
  );
}
