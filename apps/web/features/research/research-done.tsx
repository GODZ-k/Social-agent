import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ResearchView } from "@/lib/types";
import { Button } from "@repo/ui/components/button";
import { ResearchFindings } from "@/features/research/research-findings";

/** Research is done (S19b): the findings, then on to the first month's strategy. */
export function ResearchDone({
  clientId,
  research,
  basePath = "/c",
}: {
  clientId: string;
  research: ResearchView;
  basePath?: "/c" | "/admin/c";
}) {
  return (
    <div className="mx-auto max-w-4xl">
      <p className="type-label">Research done</p>
      <h1 className="type-title mt-1">Here&apos;s what we learned</h1>
      <p className="mt-2 max-w-[60ch] text-muted-foreground">
        Your strategist used this to plan your first month. It&apos;s ready for you.
      </p>

      <div className="mt-7">
        <ResearchFindings research={research} />
      </div>

      <div className="mt-7 hidden justify-end lg:flex">
        <Button size="lg" asChild>
          <Link href={`${basePath}/${clientId}/strategy`}>
            See your first month
            <ArrowRight />
          </Link>
        </Button>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-between gap-3 border-t bg-card p-4 shadow-floating lg:hidden">
        <p className="type-label">Your first month is ready.</p>
        <Button size="lg" asChild>
          <Link href={`${basePath}/${clientId}/strategy`}>
            See your first month
            <ArrowRight />
          </Link>
        </Button>
      </div>
    </div>
  );
}
