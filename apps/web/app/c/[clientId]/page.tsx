"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import { postsQuery } from "@/lib/api/queries";
import { useWorkspace } from "@/hooks/use-workspace";
import type { Client } from "@/lib/types";
import { cn, formatCompact, formatDelta, prettyUrl } from "@/lib/utils";
import { EmptyState, Panel } from "@/components/shell/states";
import { LoopTrack } from "@/components/shell/loop-track";
import { PLATFORM_LABEL, PlatformIcon } from "@/components/post/platform";
import { PostArt } from "@/components/post/post-art";
import { Button } from "@/components/ui/button";

const listFormat = new Intl.ListFormat("en", { type: "conjunction" });

export default function OverviewPage() {
  const { clientId, client } = useWorkspace();
  const { data: posts } = useQuery(postsQuery(clientId));

  if (!client) return <OverviewSkeleton />;

  const upcoming = (posts ?? [])
    .filter((p) => p.status === "scheduled" && p.scheduledFor)
    .sort((a, b) => a.scheduledFor!.localeCompare(b.scheduledFor!))
    .slice(0, 8);

  return (
    <div className="grid gap-5">
      <header className="mb-2">
        <h1 className="type-title">{client.name}</h1>
        <p className="mt-1.5 text-muted-foreground">
          {client.brand.tagline}
          <a href={client.url} target="_blank" rel="noreferrer" className="ml-2 inline-flex items-center gap-0.5 font-medium text-tint-foreground hover:underline">
            {prettyUrl(client.url)}
            <ArrowUpRight className="size-3.5" />
          </a>
        </p>
      </header>

      <NextStep client={client} />

      <Panel aria-labelledby="loop-heading">
        <h2 id="loop-heading" className="type-heading mb-5">Where the agent is</h2>
        <LoopTrack stage={client.stage} />
      </Panel>

      <dl className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
        <Metric label="Followers" value={formatCompact(client.stats.followers)} delta={client.stats.followersDelta} />
        <Metric label="Engagement rate" value={`${client.stats.engagementRate}%`} delta={client.stats.engagementDelta} />
        <Metric label="Scheduled" value={String(client.stats.scheduled)} hint="posts queued" />
        <Metric label="Needs approval" value={String(client.stats.pendingApprovals)} hint="waiting on you" />
      </dl>

      <Panel aria-labelledby="upcoming-heading" className="overflow-hidden">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 id="upcoming-heading" className="type-heading">Going out next</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href={`/c/${clientId}/calendar`}><CalendarDays /> Open calendar</Link>
          </Button>
        </div>
        {!posts ? (
          <div className="flex gap-4">{Array.from({ length: 4 }, (_, i) => <div key={i} className="skeleton aspect-[4/5] w-40 shrink-0 rounded-lg" />)}</div>
        ) : upcoming.length === 0 ? (
          <EmptyState
            icon={<CalendarDays />}
            title="Nothing is scheduled"
            description="Approved posts land here with their publish time. Draft some content to fill the calendar."
            action={<Button asChild><Link href={`/c/${clientId}/content`}>Go to content</Link></Button>}
          />
        ) : (
          // Bleeds to the panel edge so it's obvious there is more to scroll.
          <ul className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] md:-mx-6 md:px-6">
            {upcoming.map((post) => (
              <li key={post.id} className="w-40 shrink-0 snap-start">
                <PostArt post={post} brand={client.brand} fixedAspect="aspect-[4/5]" />
                <p className="mt-2.5 flex items-center gap-1.5 text-[0.8125rem] font-medium">
                  <PlatformIcon platform={post.platform} className="size-3.5 text-muted-foreground" />
                  {format(new Date(post.scheduledFor!), "EEE d MMM")}
                </p>
                <p className="type-label tabular-nums">{format(new Date(post.scheduledFor!), "h:mm a")}</p>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel aria-labelledby="brand-heading">
        <h2 id="brand-heading" className="type-heading mb-5">Brand kit</h2>
        <div className="grid gap-7 md:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="max-w-[62ch]">{client.brand.summary}</p>
            <p className="type-label mt-4">Written for</p>
            <p>{client.brand.audience}</p>
            <p className="type-label mt-4">Sounds</p>
            <p>{client.brand.voice.join(", ")}</p>
          </div>
          <div>
            <ul className="flex overflow-hidden rounded-lg ring-1 ring-border">
              {client.brand.colors.map((c) => (
                <li key={c.hex} className="h-16 flex-1" style={{ background: c.hex }} title={`${c.name} ${c.hex}`} />
              ))}
            </ul>
            <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1">
              {client.brand.colors.map((c) => (
                <li key={c.hex} className="flex items-baseline justify-between gap-2 text-[0.8125rem]">
                  <span className="truncate">{c.name}</span>
                  <span className="text-muted-foreground uppercase tabular-nums">{c.hex}</span>
                </li>
              ))}
            </ul>
            <p className="type-label mt-4">Typefaces</p>
            <p>{[...new Set([client.brand.fonts.heading, client.brand.fonts.body])].join(" with ")}</p>
          </div>
        </div>
      </Panel>
    </div>
  );
}

/** The single most useful thing to do for this client right now. */
function NextStep({ client }: { client: Client }) {
  const base = `/c/${client.id}`;
  const pending = client.stats.pendingApprovals;
  // Planned networks that can't publish yet: never connected, or access has lapsed.
  const unconnected = client.platforms.filter((p) => client.accounts.find((a) => a.platform === p)?.status !== "connected");
  const step =
    // Nothing can be published without this, so it outranks everything else.
    unconnected.length > 0
      ? { title: `Connect ${listFormat.format(unconnected.map((p) => PLATFORM_LABEL[p]))} so posts can go out`, body: "The agent can plan and draft without it, but approved posts have nowhere to publish until the account is connected.", href: `${base}/settings?tab=accounts`, cta: "Connect accounts" }
      : pending > 0
      ? { title: `${pending} ${pending === 1 ? "post is" : "posts are"} waiting for your approval`, body: "Swipe through them. Nothing is published until you say so.", href: `${base}/approvals`, cta: "Review posts" }
      : client.stage === "strategy"
        ? { title: "The strategy is ready to read", body: "Check the pillars and posting rhythm, then let the agent start drafting.", href: `${base}/strategy`, cta: "Read the strategy" }
        : client.stage === "learning"
          ? { title: "The agent has learned something", body: "Last month's results changed what it plans to post. See what and why.", href: `${base}/analytics`, cta: "See what changed" }
          : { title: "Everything is on schedule", body: "Posts are approved and queued. Check the calendar to see what goes out when.", href: `${base}/calendar`, cta: "Open calendar" };

  return (
    <section className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 rounded-xl bg-tint p-5 md:p-6">
      <div className="min-w-0">
        <h2 className="type-heading text-tint-foreground">{step.title}</h2>
        <p className="mt-1 text-tint-foreground/80">{step.body}</p>
      </div>
      <Button asChild size="lg">
        <Link href={step.href}>{step.cta}</Link>
      </Button>
    </section>
  );
}

function Metric({ label, value, delta, hint }: { label: string; value: string; delta?: number; hint?: string }) {
  return (
    <div className="rounded-xl bg-card p-4 shadow-raised md:p-5">
      <dt className="type-label">{label}</dt>
      <dd className="mt-1">
        <span className="type-number text-[1.75rem] leading-none md:text-[2rem]">{value}</span>
        <span className={cn("mt-1 block text-[0.8125rem] tabular-nums", delta === undefined || delta === 0 ? "text-muted-foreground" : delta < 0 ? "text-destructive" : "text-success")}>
          {delta !== undefined ? (delta === 0 ? "No change this month" : `${formatDelta(delta)} this month`) : hint}
        </span>
      </dd>
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="grid gap-5" aria-busy aria-label="Loading client">
      <div className="skeleton h-10 w-64" />
      <div className="skeleton h-28 rounded-xl" />
      <div className="skeleton h-36 rounded-xl" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
        {Array.from({ length: 4 }, (_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
      </div>
    </div>
  );
}
