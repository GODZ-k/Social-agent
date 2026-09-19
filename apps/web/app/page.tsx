"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, TrendingDown, TrendingUp } from "lucide-react";
import { clientsQuery } from "@/lib/api/queries";
import type { Client } from "@/lib/types";
import { brandStyle, cn, formatCompact, formatDelta, prettyUrl } from "@/lib/utils";
import { useViewer } from "@/hooks/use-viewer";
import { TopBar } from "@/components/shell/top-bar";
import { ClientAvatar } from "@repo/ui/components/social/client-avatar";
import { LoopTicks, stageInfo } from "@repo/ui/components/social/loop-track";
import { ErrorState, SkeletonRows } from "@repo/ui/components/states";
import { PlatformIcon } from "@repo/ui/components/social/platform";
import { UrlForm } from "@/components/onboarding/url-form";
import { Badge } from "@repo/ui/components/badge";

export default function ClientsPage() {
  const router = useRouter();
  const { data: clients, isPending, error, refetch } = useQuery(clientsQuery());
  const { isAdmin } = useViewer();

  // Someone with a single brand has nothing to choose between: take them straight to it.
  const onlyBrand = !isAdmin && clients?.length === 1 ? clients[0] : undefined;
  useEffect(() => {
    if (onlyBrand) router.replace(`/c/${onlyBrand.id}`);
  }, [onlyBrand, router]);

  if (onlyBrand || (!isAdmin && isPending)) {
    return (
      <div className="min-h-dvh">
        <TopBar />
        <main className="mx-auto max-w-5xl px-4 pt-14 md:px-6 md:pt-24">
          <SkeletonRows rows={3} className="[&>*]:h-24" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-dvh">
      <TopBar />
      <main className="mx-auto max-w-5xl px-4 pt-14 pb-24 md:px-6 md:pt-24">
        <section className="max-w-3xl">
          <h1 className="type-display">{isAdmin ? "Start with a website." : "Start with your website."}</h1>
          <p className="mt-5 max-w-[52ch] text-[1.0625rem] text-muted-foreground">
            {isAdmin
              ? "Paste a client's URL. The agent reads the site, works out the brand, plans the month and drafts the posts. Nothing goes out until you approve it."
              : "Paste your URL. The agent reads your site, works out your brand, plans the month and drafts the posts. Nothing goes out until you approve it."}
          </p>
          <div className="mt-8 max-w-xl">
            <UrlForm onSubmit={(url) => router.push(`/onboarding?url=${encodeURIComponent(url)}`)} />
          </div>
        </section>

        {/* A new account has no brands yet, so there is no empty list to show: the URL field is the page. */}
        {(isAdmin || (clients?.length ?? 0) > 0 || error) && (
        <section className="mt-16 md:mt-24" aria-labelledby="clients-heading">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 id="clients-heading" className="type-heading">
              {isAdmin ? "All clients" : "Your brands"}
            </h2>
            {clients && <span className="type-label tabular-nums">{clients.length} in total</span>}
          </div>

          {isPending && <SkeletonRows rows={4} className="[&>*]:h-[5.5rem]" />}
          {error && <ErrorState error={error} onRetry={() => refetch()} />}
          {clients && (
            <ul className="grid gap-3">
              {clients.map((client) => (
                <li key={client.id}>
                  <ClientRow client={client} />
                </li>
              ))}
            </ul>
          )}
        </section>
        )}
      </main>
    </div>
  );
}

function ClientRow({ client }: { client: Client }) {
  const { stats } = client;
  return (
    <Link
      href={`/c/${client.id}`}
      // Each row carries its own brand, so the ticks and badges are in the client's colour.
      style={brandStyle(client.accent)}
      className="brand-scope pressable group grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-3 rounded-xl bg-card p-4 shadow-raised hover:shadow-floating md:grid-cols-[auto_minmax(0,1.4fr)_minmax(0,1fr)_auto_auto] md:gap-x-6 md:p-5"
    >
      <ClientAvatar client={client} className="size-11 text-lg" />

      <div className="min-w-0">
        <p className="truncate font-display text-[1.0625rem] font-semibold tracking-tight">{client.name}</p>
        <p className="type-label flex items-center gap-2 truncate">
          <span className="truncate">{prettyUrl(client.url)}</span>
          <span className="flex shrink-0 gap-1">
            {client.platforms.map((p) => (
              <PlatformIcon key={p} platform={p} className="size-3.5" />
            ))}
          </span>
        </p>
      </div>

      <div className="col-span-3 min-w-0 md:col-span-1">
        <LoopTicks stage={client.stage} />
        <p className="type-label mt-1.5 truncate">{stageInfo(client.stage).doing}</p>
      </div>

      <dl className="col-span-2 flex gap-6 md:col-span-1">
        <Stat label="Followers" value={formatCompact(stats.followers)} delta={stats.followersDelta} />
        <Stat label="Engagement" value={`${stats.engagementRate}%`} delta={stats.engagementDelta} />
      </dl>

      <div className="flex items-center justify-end gap-2">
        {stats.pendingApprovals > 0 && <Badge variant="tint">{stats.pendingApprovals} to approve</Badge>}
        <ChevronRight className="size-4.5 text-muted-foreground transition-transform duration-200 ease-out-soft group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

function Stat({ label, value, delta }: { label: string; value: string; delta: number }) {
  const Icon = delta < 0 ? TrendingDown : TrendingUp;
  return (
    <div>
      <dt className="type-label">{label}</dt>
      <dd className="flex items-baseline gap-1.5">
        <span className="type-number text-[1.0625rem]">{value}</span>
        {delta !== 0 && (
          <span className={cn("flex items-center gap-0.5 text-xs tabular-nums", delta < 0 ? "text-destructive" : "text-success")}>
            <Icon className="size-3" />
            {formatDelta(delta)}
          </span>
        )}
      </dd>
    </div>
  );
}
