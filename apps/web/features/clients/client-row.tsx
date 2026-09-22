import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Client } from "@/lib/types";
import { brandStyle, formatCompact, prettyUrl } from "@/lib/utils";
import { Badge } from "@repo/ui/components/badge";
import { ClientAvatar } from "@repo/ui/components/social/client-avatar";
import { LoopTicks } from "@repo/ui/components/social/loop-track";
import { stageInfo } from "@repo/ui/components/social/loop-stages";
import { PlatformIcon } from "@repo/ui/components/social/platform";
import { ClientStat } from "./client-stat";

export function ClientRow({ client }: { client: Client }) {
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
        <ClientStat label="Followers" value={formatCompact(stats.followers)} delta={stats.followersDelta} />
        <ClientStat label="Engagement" value={`${stats.engagementRate}%`} delta={stats.engagementDelta} />
      </dl>

      <div className="flex items-center justify-end gap-2">
        {stats.pendingApprovals > 0 && <Badge variant="tint">{stats.pendingApprovals} to approve</Badge>}
        <ChevronRight className="size-4.5 text-muted-foreground transition-transform duration-200 ease-out-soft group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
