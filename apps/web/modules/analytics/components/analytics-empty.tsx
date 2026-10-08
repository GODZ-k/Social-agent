import Link from "next/link";
import { format, parseISO } from "date-fns";
import { ChartNoAxesCombined, Link2 } from "lucide-react";
import type { Brand, PostView } from "@/lib/types";
import { PLATFORM_LABEL } from "@repo/ui/components/social/platform";
import { Panel } from "@repo/ui/components/states";
import { Button } from "@repo/ui/components/button";
import { IconCircle } from "@repo/ui/components/icon-circle";
import { formatList, unconnectedPlatforms } from "@/lib/utils";
import { AnalyticsPreviewChart } from "./analytics-preview-chart";
import { EmptyStep } from "./empty-step";
import { postsLabel } from "@/lib/report-format";
import { routes, workspaceRoutes } from "@/config/routes";
import type { WorkspaceBase } from "@/config/routes";

const WHEN_STEPS = [
  { title: "A day after the first post", body: "How many people saw it, saved it and followed you, for each post." },
  { title: "After a week of posts", body: "Which formats, platforms and themes work best, and the agent's first findings." },
  { title: "After a month", body: "The month in one line, and next month's plan updated from what worked." },
];

/** Nothing has published yet: what's blocking it, and what this page looks like once it does. */
export function AnalyticsEmpty({
  brand,
  reviewPosts,
  basePath = routes.brand.base,
}: {
  brand: Brand;
  reviewPosts: PostView[];
  basePath?: WorkspaceBase;
}) {
  const unconnected = unconnectedPlatforms(brand);
  const unconnectedNames = formatList(unconnected.map((p) => PLATFORM_LABEL[p]));
  const pending = reviewPosts.length;
  const firstPost = reviewPosts[0];
  const scheduled = firstPost?.scheduledFor ? parseISO(firstPost.scheduledFor) : null;
  const stepCount = (unconnected.length > 0 ? 1 : 0) + (pending > 0 ? 1 : 0);

  return (
    <div className="grid gap-5">
      <Panel>
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <IconCircle className="mb-4 size-12 bg-tint text-tint-foreground">
              <ChartNoAxesCombined className="size-5" />
            </IconCircle>
            <h2 className="type-heading">No results yet, because nothing has gone out</h2>
            <p className="mt-1.5 max-w-[52ch] text-muted-foreground">
              {scheduled
                ? `Your first post is ready for ${format(scheduled, "EEEE d MMMM")} at ${format(scheduled, "h:mm a")}.`
                : "Numbers show up here once a post goes out."}
              {stepCount > 0 && ` ${stepCount === 1 ? "One thing stands" : "Two things stand"} between it and your first numbers:`}
            </p>
            {stepCount > 0 && (
              <div className="mt-5 grid gap-2.5">
                {unconnected.length > 0 && (
                  <EmptyStep
                    number={1}
                    title={`Connect ${unconnectedNames}`}
                    body="Posts can’t go out, and results can’t come back, until they’re connected."
                  >
                    <Button asChild size="sm">
                      <Link href={workspaceRoutes(basePath).settingsTab(brand.id, "accounts")}>
                        <Link2 />
                        Connect
                      </Link>
                    </Button>
                  </EmptyStep>
                )}
                {pending > 0 && (
                  <EmptyStep
                    number={unconnected.length > 0 ? 2 : 1}
                    title={`Approve the ${pending} waiting ${pending === 1 ? "post" : "posts"}`}
                    body="Nothing is published without your approval."
                  >
                    <Button asChild variant="outline" size="sm">
                      <Link href={workspaceRoutes(basePath).approvals(brand.id)}>Review {postsLabel(pending)}</Link>
                    </Button>
                  </EmptyStep>
                )}
              </div>
            )}
          </div>
          <div>
            <h3 className="type-heading text-base">When this page fills in</h3>
            <ol className="mt-5 grid gap-4 border-l-2 border-border pl-5">
              {WHEN_STEPS.map((step) => (
                <li key={step.title}>
                  <p className="font-medium">{step.title}</p>
                  <p className="type-label mt-0.5">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Panel>
      <AnalyticsPreviewChart />
    </div>
  );
}
