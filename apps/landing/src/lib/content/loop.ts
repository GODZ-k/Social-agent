import type { LoopStage } from "@/lib/types";

/** The agent's loop, in the order LoopTrack draws it. */
export const LOOP_STEPS: { stage: LoopStage; title: string; body: string }[] = [
  {
    stage: "onboarding",
    title: "It reads your website",
    body: "Paste your address. The agent reads your pages and builds a brand kit from them: your colours, your tone of voice, what you sell and who you sell it to.",
  },
  {
    stage: "strategy",
    title: "It plans a strategy",
    body: "You get a short plan you can read in two minutes: the topics to post about, which networks suit you, and how often to post on each.",
  },
  {
    stage: "content",
    title: "It drafts the posts",
    body: "A month of posts, written in your voice and drawn in your colours. Each one carries a note explaining why the agent made it.",
  },
  {
    stage: "approval",
    title: "You approve",
    body: "Swipe right to approve, left to reject, or open a post and edit it. Nothing is published until you have said yes to it.",
  },
  {
    stage: "publishing",
    title: "It publishes on schedule",
    body: "Approved posts go out at the times your followers are usually online. You can move any of them on the calendar.",
  },
  {
    stage: "learning",
    title: "It learns from the results",
    body: "The agent measures what each post did, tells you what it learned and the evidence for it, then writes the next strategy from that.",
  },
];
