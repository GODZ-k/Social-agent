import { Sparkles } from "lucide-react";
import type { AnalyticsReport } from "@/lib/types";
import type { WorkspaceBasePath } from "@/lib/workspace-path";
import { LearnedPanel } from "./learned-panel";
import { SoonPanel } from "./soon-panel";

/** Findings that changed the strategy, or a plain note that it's too early for any yet. */
export function LearnedSection({
  report,
  brandId,
  basePath = "/c",
}: {
  report: AnalyticsReport;
  brandId: string;
  basePath?: WorkspaceBasePath;
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
