"use client";

import { useState } from "react";
import { Archive, ChevronDown, ChevronUp } from "lucide-react";
import type { BrandCard } from "@/lib/types";

/** The archived brands, collapsed by default so the active ones stay in front. */
export function ArchivedBrandsToggle({ brands }: { brands: BrandCard[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-4 border-t pt-4">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between gap-3 text-sm text-muted-foreground">
        <span className="flex items-center gap-2">
          <Archive className="size-4" />
          {brands.length === 1 ? "1 archived brand" : `${brands.length} archived brands`}: {brands.map((b) => b.name).join(", ")}
        </span>
        {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
      </button>
      {open && (
        <ul className="mt-3 grid gap-1.5">
          {brands.map((brand) => (
            <li key={brand.id} className="type-label">
              {brand.name} ({brand.url})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
