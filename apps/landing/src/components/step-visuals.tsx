import { Badge } from "@repo/ui/components/badge";
import { TrendChart } from "@repo/ui/components/social/charts";
import { PlatformIcon, PLATFORM_LABEL, StatusBadge } from "@repo/ui/components/social/platform";
import { PostArt } from "@repo/ui/components/social/post-art";
import { Panel } from "@repo/ui/components/states";
import { brandStyle } from "@repo/ui/lib/utils";
import { ApprovalDemo } from "./approval-demo";
import { BRANDS } from "@/lib/content/brands";
import { DEMO_POSTS, REACH_TREND } from "@/lib/content/posts";
import type { LoopStage } from "@/lib/types";

// Every visual shows the same example business, so the page reads as one account going round the loop.
const brand = BRANDS[0]!;

const PILLARS = [
  { name: "Classes and courses", share: "40%", why: "Your classes page is the most visited on your site." },
  { name: "Behind the scenes", share: "35%", why: "Process posts reach people who don't follow you yet." },
  { name: "Finished pieces", share: "25%", why: "Your shop links convert best from product photos." },
];

function BrandKitVisual() {
  return (
    <Panel>
      <p className="type-heading">{brand.name}</p>
      <p className="type-label mt-1">Read from kilnandclay.example</p>
      <ul className="mt-5 grid grid-cols-4 gap-3">
        {brand.kit.colors.map((color) => (
          <li key={color.name} className="min-w-0">
            {/* The swatch is the client's data, so its colour is set inline rather than from a token. */}
            <span className="block aspect-square rounded-md ring-1 ring-border" style={{ background: color.hex }} />
            <span className="type-label mt-2 block truncate">{color.name}</span>
          </li>
        ))}
      </ul>
      <p className="mt-5 font-medium">Tone of voice</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {["Warm", "Hands-on", "Plain spoken"].map((tone) => (
          <Badge key={tone} variant="tint">{tone}</Badge>
        ))}
      </div>
    </Panel>
  );
}

function StrategyVisual() {
  return (
    <Panel>
      <p className="type-heading">Content pillars</p>
      <ul className="mt-4 divide-y divide-border">
        {PILLARS.map((pillar) => (
          <li key={pillar.name} className="flex gap-4 py-3.5">
            <span className="type-number w-12 shrink-0 text-xl text-tint-foreground">{pillar.share}</span>
            <span className="min-w-0">
              <span className="block font-medium">{pillar.name}</span>
              <span className="type-label mt-0.5 block">{pillar.why}</span>
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function DraftsVisual() {
  return (
    <div>
      <div className="grid grid-cols-3 items-start gap-2.5">
        {DEMO_POSTS.slice(0, 3).map((post) => (
          <PostArt key={post.id} post={post} brand={brand.kit} fixedAspect="aspect-[4/5]" className="rounded-xl shadow-raised" />
        ))}
      </div>
      <Panel className="mt-4 bg-tint shadow-none">
        <p className="font-medium text-tint-foreground">Why the agent made the first one</p>
        <p className="mt-1 text-muted-foreground">{DEMO_POSTS[0]!.aiNote}</p>
      </Panel>
    </div>
  );
}

function ScheduleVisual() {
  return (
    <Panel>
      <p className="type-heading">This week</p>
      <ul className="mt-4 divide-y divide-border">
        {DEMO_POSTS.map((post, i) => (
          <li key={post.id} className="flex items-center gap-3 py-3">
            <PlatformIcon platform={post.platform} className="size-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{post.hook}</span>
              <span className="type-label block tabular-nums">
                {PLATFORM_LABEL[post.platform]}, {SLOTS[i]}
              </span>
            </span>
            <StatusBadge status={i === 0 ? "published" : "scheduled"} />
          </li>
        ))}
      </ul>
    </Panel>
  );
}

// Written out rather than formatted from the dates, so the server and the browser can't disagree over time zones.
const SLOTS = ["Thu 1 Oct, 6:30 PM", "Sat 3 Oct, 12:00 PM", "Mon 5 Oct, 7:00 PM", "Wed 7 Oct, 9:00 AM"];

function LearnVisual() {
  return (
    <Panel>
      <p className="type-heading">Reach</p>
      <p className="type-label mt-1">Example numbers for the first 30 days.</p>
      <div className="mt-4">
        <TrendChart rows={REACH_TREND} metric="Reach" />
      </div>
    </Panel>
  );
}

/** The real component that goes with each step of the loop, filled with example data. */
export function StepVisual({ stage }: { stage: LoopStage }) {
  const visual = {
    onboarding: <BrandKitVisual />,
    strategy: <StrategyVisual />,
    content: <DraftsVisual />,
    approval: <ApprovalDemo />,
    publishing: <ScheduleVisual />,
    learning: <LearnVisual />,
  }[stage];

  return (
    <div className="brand-scope min-w-0" style={brandStyle(brand.accent)}>
      {visual}
    </div>
  );
}
