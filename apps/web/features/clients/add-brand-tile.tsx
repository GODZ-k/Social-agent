import Link from "next/link";
import { Plus } from "lucide-react";

/** BA-1: a quiet dashed tile at the end of the grid, the same size as a brand card. */
export function AddBrandTile() {
  return (
    <Link
      href="/onboarding"
      className="group flex min-h-60 flex-col items-center justify-center gap-2.5 rounded-2xl border-[1.5px] border-dashed border-input p-6 text-center text-muted-foreground transition-colors hover:border-primary hover:bg-card hover:text-foreground max-[560px]:min-h-0 max-[560px]:flex-row max-[560px]:justify-start max-[560px]:gap-3.5 max-[560px]:p-4 max-[560px]:text-left"
    >
      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-tint text-tint-foreground">
        <Plus className="size-5" />
      </span>
      <span className="grid gap-1 text-sm">
        <b className="text-[1rem] font-semibold text-foreground">Add a brand</b>
        <span className="max-w-72">Paste its website. The agent reads it and drafts a brand kit for you to check.</span>
      </span>
    </Link>
  );
}
