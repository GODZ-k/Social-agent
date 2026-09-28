import Link from "next/link";
import { format, parseISO } from "date-fns";
import { ArrowRight, CircleAlert, CircleCheck, Clock } from "lucide-react";
import type { Client } from "@/lib/types";
import { listReviewQueue } from "@/lib/api/server";
import { brandStyle, prettyUrl } from "@/lib/utils";
import { workspaceHref, type WorkspaceBasePath } from "@/lib/workspace-path";
import { ClientAvatar } from "@repo/ui/components/social/client-avatar";
import { LoopTicks } from "@repo/ui/components/social/loop-track";
import { stageInfo } from "@repo/ui/components/social/loop-stages";
import { PLATFORM_LABEL, PlatformIcon } from "@repo/ui/components/social/platform";
import { BrandNeedLine } from "@/features/clients/brand-need-line";

async function firstScheduledAt(clientId: string): Promise<string | null | undefined> {
  const queue = await listReviewQueue(clientId);
  return queue.find((post) => post.scheduledFor)?.scheduledFor;
}

/** BA-1: one live brand, tinted by its own colour. What needs the owner comes before the open link. */
export async function BrandTile({ client, basePath = "/c" }: { client: Client; basePath?: WorkspaceBasePath }) {
  const expired = client.accounts.filter((account) => account.status === "expired");
  const pendingApprovals = client.stats.pendingApprovals;
  const nextDue = pendingApprovals > 0 ? await firstScheduledAt(client.id) : null;

  return (
    <article
      className="brand-scope group has-[a:focus-visible]:outline-primary relative grid gap-4 rounded-2xl bg-card p-5 shadow-raised transition-shadow hover:shadow-floating has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-[3px] md:p-6"
      style={brandStyle(client.accent)}
    >
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3.5">
        <ClientAvatar client={client} className="size-12 text-lg" />
        <div className="min-w-0">
          <Link href={workspaceHref(basePath, client.id)} className="outline-none after:absolute after:inset-0 after:content-['']">
            <h2 className="truncate font-display text-[1.1875rem] font-semibold tracking-tight">{client.name}</h2>
          </Link>
          <p className="type-label flex items-center gap-2 truncate">
            <span className="truncate">{prettyUrl(client.url)}</span>
            <span className="flex shrink-0 gap-1">
              {client.platforms.map((platform) => (
                <PlatformIcon key={platform} platform={platform} className="size-3.5" />
              ))}
            </span>
          </p>
        </div>
        <span
          aria-hidden
          className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
        >
          <ArrowRight className="size-4" />
        </span>
      </div>

      <LoopTicks stage={client.stage} />
      <p className="type-label">
        Now: <b className="font-medium text-foreground">{stageInfo(client.stage).doing}</b>
      </p>

      {pendingApprovals > 0 || expired.length > 0 ? (
        <div className="grid gap-1.5">
          {pendingApprovals > 0 && (
            <BrandNeedLine
              icon={<Clock />}
              title={`${pendingApprovals} ${pendingApprovals === 1 ? "post" : "posts"} to approve`}
              detail={nextDue ? `The first goes out ${format(parseISO(nextDue), "EEE d MMM, h:mm a")}` : "Review them so they can go out on schedule."}
              actionLabel="Approve posts"
              href={workspaceHref(basePath, client.id, "/approvals")}
            />
          )}
          {expired.map((account) => (
            <BrandNeedLine
              key={account.platform}
              icon={<CircleAlert />}
              title={`${PLATFORM_LABEL[account.platform]} connection expired`}
              detail={`Posts for ${PLATFORM_LABEL[account.platform]} wait until you reconnect`}
              actionLabel="Reconnect"
              href={workspaceHref(basePath, client.id, "/settings?tab=accounts")}
            />
          ))}
        </div>
      ) : (
        <p className="relative z-10 flex min-h-12 items-center gap-2.5 rounded-2xl bg-success/8 px-3 text-sm">
          <CircleCheck className="size-4 shrink-0 text-success" />
          <b className="font-medium text-foreground">Nothing needs you.</b>
        </p>
      )}
    </article>
  );
}
