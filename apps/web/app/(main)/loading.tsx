import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@repo/ui/components/states";
import { Button } from "@repo/ui/components/button";
import { TopBarFrame } from "@/components/shell/frames";

/**
 * LD-3: "Your brands" at `/`, whose page awaits `getViewer()` and `listActiveBrands()` at its top
 * level, so the whole route waits. Before this it fell back to `app/loading.tsx` — three generic
 * cards in a narrower column, which looked nothing like the tiles and jumped when they arrived.
 *
 * Real: the bar, the wordmark, the title and the "Add a brand" button, none of which depend on the
 * request. Sketched: the avatar, the count line, and three tiles. The dashed "Add a brand" tile is
 * deliberately left out — its position depends on how many brands there are, and guessing it is the
 * one thing that would shift the grid.
 */
export default function BrandsLoading() {
  return (
    <div className="min-h-dvh">
      <TopBarFrame wordmark>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <div className="skeleton size-8 rounded-full" />
        </div>
      </TopBarFrame>
      <main className="mx-auto max-w-[76rem] px-4 pt-14 pb-24 md:px-6 md:pt-24">
        <section className="mx-auto max-w-[76rem]">
          <PageHeader
            title="Your brands"
            description={<span className="skeleton mt-1 block h-4 w-56 max-w-full rounded-full" />}
            actions={
              <Button asChild>
                <Link href="/onboarding">
                  <Plus /> Add a brand
                </Link>
              </Button>
            }
          />
          <div role="status" aria-label="Loading your brands" className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,22rem),1fr))] gap-5">
            {[0, 1, 2].map((tile) => (
              <div key={tile} className="grid gap-4 rounded-2xl bg-card p-5 shadow-raised md:p-6">
                <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3.5">
                  <div className="skeleton size-11 rounded-full" />
                  <div className="min-w-0">
                    <div className="skeleton h-4.5 w-32 rounded-full" />
                    <div className="skeleton mt-2 h-3.5 w-40 rounded-full" />
                  </div>
                </div>
                <div className="skeleton h-1.5 w-full rounded-full" />
                <div className="skeleton h-12 w-full rounded-xl" />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
