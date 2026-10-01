import Link from "next/link";
import { format, parseISO } from "date-fns";
import { ChevronRight, Eye } from "lucide-react";
import type { AdminClientRow, Brand } from "@/lib/types";
import { getStrategy, listContent } from "@/lib/api/server";
import { prettyUrl } from "@/lib/utils";
import { workspaceHref } from "@/lib/workspace-path";
import { Badge } from "@repo/ui/components/badge";
import { Panel } from "@repo/ui/components/states";
import { Button } from "@repo/ui/components/button";
import { LoopTrack, LoopTrackNote } from "@repo/ui/components/social/loop-track";
import { PLATFORM_LABEL, PlatformIcon } from "@repo/ui/components/social/platform";

/** One brand, in full: where it is in the loop, what needs the admin, and its accounts, strategy and posts. */
export async function AdminBrandCard({ brand, clientRow }: { brand: Brand; clientRow: AdminClientRow }) {
  const [strategy, posts] = await Promise.all([getStrategy(brand.id), listContent(brand.id)]);
  const published = posts.filter((p) => p.state === "published").length;
  const expired = clientRow.expiredConnections.filter((e) => e.brandId === brand.id);
  const needsApproval = brand.stats.pendingApprovals;

  return (
    <Panel>
      <div className="flex flex-wrap items-center gap-3">
        <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-[30%] font-display font-semibold text-white" style={{ background: brand.accent }}>
          {brand.name.charAt(0)}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="type-heading truncate">{brand.name}</h3>
          <a href={brand.url} target="_blank" rel="noreferrer" className="type-label truncate text-tint-foreground hover:underline">
            {prettyUrl(brand.url)}
          </a>
        </div>
        <Button asChild size="sm" className="w-full sm:w-auto">
          <Link href={workspaceHref("/admin/c", brand.id)}>
            <Eye /> Open workspace
          </Link>
        </Button>
      </div>

      <div className="mt-4">
        <LoopTrack stage={brand.stage} />
        <LoopTrackNote />
      </div>

      {(needsApproval > 0 || expired.length > 0) && (
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl bg-warning/8 p-3.5">
          <span className="text-sm font-medium">Needs you:</span>
          {needsApproval > 0 && <Badge variant="warning">{needsApproval} posts to approve</Badge>}
          {expired.map((e) => (
            <Badge key={e.platform} variant="warning">
              {PLATFORM_LABEL[e.platform]} access expired
            </Badge>
          ))}
          <Link href={workspaceHref("/admin/c", brand.id, "/approvals")} className="ml-auto inline-flex items-center gap-0.5 text-sm font-medium text-tint-foreground hover:underline">
            Approve posts <ChevronRight className="size-3.5" />
          </Link>
        </div>
      )}

      <div className="mt-4 border-t sm:grid sm:grid-cols-[5rem_1fr]">
        <div className="flex flex-col gap-1 border-b py-3 sm:contents">
          <p className="type-label sm:border-b sm:py-3">Accounts</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.8125rem] sm:border-b sm:py-3">
            {brand.accounts.map((account) => {
              const exp = expired.find((e) => e.platform === account.platform);
              const isExpired = account.status === "expired";
              return (
                <span key={account.platform} className="flex items-center gap-1.5">
                  <PlatformIcon platform={account.platform} className={isExpired ? "text-warning" : "text-success"} />
                  <span className={isExpired ? "text-warning" : undefined}>
                    {isExpired ? `Expired ${format(parseISO(exp?.expiredAt ?? account.connectedAt), "d MMM")}` : "Connected"}
                  </span>
                </span>
              );
            })}
            {brand.accounts.length === 0 && <span className="type-label">None connected</span>}
          </div>
        </div>
        <div className="flex flex-col gap-1 border-b py-3 sm:contents">
          <p className="type-label sm:border-b sm:py-3">Strategy</p>
          <p className="text-[0.8125rem] sm:border-b sm:py-3">
            {strategy ? `Running since ${format(parseISO(strategy.activatedAt ?? strategy.generatedAt), "d MMM")}, version ${strategy.version}` : "Not started yet"}
          </p>
        </div>
        <div className="flex flex-col gap-1 py-3 sm:contents">
          <p className="type-label sm:py-3">Posts</p>
          <p className="text-[0.8125rem] sm:py-3">
            {needsApproval} waiting for approval, {brand.stats.scheduled} scheduled, {published} published
          </p>
        </div>
      </div>
    </Panel>
  );
}
