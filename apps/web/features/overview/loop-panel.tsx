import type { LoopStage } from "@social-agent/shared";
import { Panel } from "@repo/ui/components/states";
import { LoopTrack } from "@repo/ui/components/social/loop-track";

/** What's true now and what comes next, one line per stage. */
const STAGE_SUBTITLE: Record<LoopStage, string> = {
  onboarding: "It's reading the website to build the brand kit. Next: a strategy to review.",
  strategy: "It has a strategy ready to review. Next: drafting the first posts.",
  content: "It has a strategy and has drafted the first posts. Next: your approvals.",
  approval: "Posts are waiting for your approval. Next: publishing on schedule.",
  publishing: "Approved posts are going out on schedule. Next: learning from the results.",
  learning: "It's learning from last month's results. Next: an updated strategy.",
};

export function LoopPanel({ stage }: { stage: LoopStage }) {
  const subtitle = STAGE_SUBTITLE[stage];

  return (
    <Panel aria-labelledby="loop-heading">
      <h2 id="loop-heading" className="type-heading">Where the agent is</h2>
      <p className="type-label mt-1 mb-5">{subtitle}</p>
      <LoopTrack stage={stage} />
    </Panel>
  );
}
