import Link from "next/link";
import { Plus } from "lucide-react";
import type { Client } from "@/lib/types";
import { PageHeader } from "@repo/ui/components/states";
import { Button } from "@repo/ui/components/button";
import { AddBrandTile } from "@/features/clients/add-brand-tile";

/** How many of these brands want the owner today: still setting up, waiting on approval, or a lapsed connection. */
function needsCount(clients: Client[]): number {
  return clients.filter(
    (client) => client.stage === "onboarding" || client.stats.pendingApprovals > 0 || client.accounts.some((account) => account.status === "expired"),
  ).length;
}

function needsSentence(needing: number): string {
  if (needing === 0) return "Nothing needs you today.";
  if (needing === 1) return "1 needs you today.";
  return `${needing} need you today.`;
}

/**
 * BA-1: the grid of brand tiles. Each tile is rendered by the page (it may read its own posts or
 * onboarding state), so this file only lays them out; it never imports the tile components itself.
 */
export function ClientList({ clients, tiles }: { clients: Client[]; tiles: React.ReactNode[] }) {
  const needing = needsCount(clients);
  const lede = `${clients.length} ${clients.length === 1 ? "brand" : "brands"}. ${needsSentence(needing)}`;

  return (
    <section className="mx-auto max-w-[76rem]">
      <PageHeader
        title="Your brands"
        description={lede}
        actions={
          <Button asChild>
            <Link href="/onboarding">
              <Plus /> Add a brand
            </Link>
          </Button>
        }
      />
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,22rem),1fr))] gap-5">
        {tiles}
        <AddBrandTile />
      </div>
    </section>
  );
}
