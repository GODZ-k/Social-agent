import Link from "next/link";
import { Plus } from "lucide-react";
import type { Brand } from "@/lib/types";
import { PageHeader } from "@repo/ui/components/states";
import { Button } from "@repo/ui/components/button";
import { AddBrandTile } from "@/components/brands/add-brand-tile";

/** How many of these brands want the owner today: still setting up, waiting on approval, or a lapsed connection. */
function needsCount(brands: Brand[]): number {
  return brands.filter(
    (brand) => brand.stage === "onboarding" || brand.stats.pendingApprovals > 0 || brand.accounts.some((account) => account.status === "expired"),
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
export function BrandList({ brands, tiles }: { brands: Brand[]; tiles: React.ReactNode[] }) {
  const needing = needsCount(brands);
  const lede = `${brands.length} ${brands.length === 1 ? "brand" : "brands"}. ${needsSentence(needing)}`;

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
