import { AlertCircle, Clock } from "lucide-react";
import type { AdminClientRow } from "@/lib/types";
import { PLATFORM_LABEL } from "@repo/ui/components/social/platform";
import { AttentionTile } from "./attention-tile";
import { summarizeNames } from "@/modules/admin/utils/format";
import { routes } from "@/config/routes";

/** What needs the admin right now, across every client, before the list itself. */
export function AttentionTiles({ clients }: { clients: AdminClientRow[] }) {
  const withPosts = clients.filter((c) => c.postsToApprove > 0);
  const posts = withPosts.reduce((sum, c) => sum + c.postsToApprove, 0);

  const expired = clients.flatMap((c) => c.expiredConnections);
  const expiredBrands = [...new Set(expired.map((e) => e.brandName))];
  const clientWithExpired = clients.find((c) => c.expiredConnections.length > 0);

  const failed = clients.flatMap((c) => c.failedRuns.map((r) => ({ ...r, clientId: c.id })));

  return (
    <section aria-label="What needs you" className="mb-5 grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-3 lg:gap-4">
      <AttentionTile
        icon={Clock}
        tone={posts > 0 ? "warning" : "clear"}
        count={posts}
        label="posts to approve"
        detail={posts > 0 ? `Across ${summarizeNames(withPosts.map((c) => c.name ?? c.email))}.` : "Nothing waiting."}
        href={withPosts.length === 1 ? routes.admin.clients.detail(withPosts[0]!.id) : routes.admin.clients.needsYou}
        linkLabel={withPosts.length === 1 ? "Show client" : `Show ${withPosts.length} clients`}
      />
      <AttentionTile
        icon={AlertCircle}
        tone={expired.length > 0 ? "warning" : "clear"}
        count={expired.length}
        label={expired.length === 1 ? "connection to fix" : "connections to fix"}
        detail={expired.length > 0 ? `${PLATFORM_LABEL[expired[0]!.platform]} for ${expired[0]!.brandName}, expired.` : "Nothing waiting."}
        href={expiredBrands.length === 1 && clientWithExpired ? routes.admin.clients.detail(clientWithExpired.id) : routes.admin.clients.needsYou}
        linkLabel={expiredBrands.length === 1 ? "Show client" : `Show ${expiredBrands.length} clients`}
      />
      <AttentionTile
        icon={AlertCircle}
        tone={failed.length > 0 ? "bad" : "clear"}
        count={failed.length}
        label={failed.length === 1 ? "failed run" : "failed runs"}
        detail={failed.length > 0 ? summarizeNames(failed.map((r) => (r.kind === "research" ? `Research for ${r.brandName}` : `a website scan for ${r.brandName}`))) + "." : "Nothing waiting."}
        href={routes.admin.observability.overview}
        linkLabel="See in Observability"
      />
    </section>
  );
}
