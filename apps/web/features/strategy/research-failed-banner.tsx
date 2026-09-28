import { TriangleAlert } from "lucide-react";
import { Panel } from "@repo/ui/components/states";

export function ResearchFailedBanner({ error }: { error: string | null }) {
  return (
    <Panel className="mb-5 flex items-start gap-3 bg-destructive/8 shadow-none">
      <TriangleAlert className="size-5 shrink-0 text-destructive" />
      <div>
        <h2 className="type-heading">The last research run failed</h2>
        <p className="type-label mt-1">{error ?? "Something went wrong. Try running it again."}</p>
      </div>
    </Panel>
  );
}
