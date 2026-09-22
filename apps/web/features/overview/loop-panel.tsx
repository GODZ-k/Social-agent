import type { LoopStage } from "@/lib/types";
import { Panel } from "@repo/ui/components/states";
import { LoopTrack } from "@repo/ui/components/social/loop-track";

export function LoopPanel({ stage }: { stage: LoopStage }) {
  return (
    <Panel aria-labelledby="loop-heading">
      <h2 id="loop-heading" className="type-heading mb-5">Where the agent is</h2>
      <LoopTrack stage={stage} />
    </Panel>
  );
}
