import Link from "next/link";
import { format, parseISO } from "date-fns";
import { ChevronRight } from "lucide-react";
import type { Brand, PostView } from "@/lib/types";
import { formatCompact, formatDelta } from "@/lib/utils";
import { StatTile } from "./stat-tile";
import { routes, workspaceRoutes } from "@/config/routes";
import type { WorkspaceBase } from "@/config/routes";

/** Followers and engagement read as pending until an account is connected and posting starts. */
export function StatTiles({
  brand,
  reviewPosts,
  scheduledPosts,
  basePath = routes.brand.base,
}: {
  brand: Brand;
  reviewPosts: PostView[];
  scheduledPosts: PostView[];
  basePath?: WorkspaceBase;
}) {
  const connected = brand.accounts.some((a) => a.status === "connected");
  const next = scheduledPosts[0];

  return (
    <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
      <StatTile label="Needs approval" value={String(reviewPosts.length)}>
        {reviewPosts.length > 0 ? (
          <Link href={workspaceRoutes(basePath).approvals(brand.id)} className="inline-flex items-center gap-0.5 font-medium text-tint-foreground hover:underline">
            Review now <ChevronRight className="size-3.5" />
          </Link>
        ) : (
          <span className="text-muted-foreground">Nothing waiting</span>
        )}
      </StatTile>

      <StatTile label="Scheduled" value={String(scheduledPosts.length)}>
        <span className="text-muted-foreground">
          {next?.scheduledFor ? `Next: ${format(parseISO(next.scheduledFor), "EEE d MMM, h:mm a")}` : "Nothing queued"}
        </span>
      </StatTile>

      {connected ? (
        <StatTile label="Followers" value={formatCompact(brand.stats.followers)}>
          <span className={deltaTone(brand.stats.followersDelta)}>{deltaLine(brand.stats.followersDelta)}</span>
        </StatTile>
      ) : (
        <StatTile label="Followers">
          <span className="text-muted-foreground">Shows up once an account is connected.</span>
        </StatTile>
      )}

      {connected ? (
        <StatTile label="Engagement" value={`${brand.stats.engagementRate}%`}>
          <span className={deltaTone(brand.stats.engagementDelta)}>{deltaLine(brand.stats.engagementDelta)}</span>
        </StatTile>
      ) : (
        <StatTile label="Engagement">
          <span className="text-muted-foreground">Starts a day after the first post goes out.</span>
        </StatTile>
      )}
    </dl>
  );
}

function deltaTone(delta: number): string {
  if (delta === 0) return "text-muted-foreground";
  return delta < 0 ? "text-destructive" : "text-success";
}

function deltaLine(delta: number): string {
  return delta === 0 ? "No change this month" : `${formatDelta(delta)} this month`;
}
