import { Sparkles } from "lucide-react";
import type { AnalyticsReport } from "@/lib/types";
import { LearnedPanel } from "./learned-panel";
import { SoonPanel } from "./soon-panel";
import { routes } from "@/config/routes";
import type { WorkspaceBase } from "@/config/routes";

/** Findings that changed the strategy, or a plain note that it's too early for any yet. */
export function LearnedSection({
  report,
  brandId,
  basePath = routes.brand.base,
}: {
  report: AnalyticsReport;
  brandId: string;
  basePath?: WorkspaceBase;
}) {
  if (report.learnings.length > 0) {
    return <LearnedPanel brandId={brandId} learnings={report.learnings} basePath={basePath} />;
  }
  if (report.phase === "first_week") {
    return (
      <SoonPanel
        title="What the agent learned"
        description="Findings that change the strategy."
        icon={<Sparkles />}
        heading="First findings after about a week"
        body="The agent needs more results before it can tell what's working. It updates the strategy once it knows."
      />
    );
  }
  return null;
}
