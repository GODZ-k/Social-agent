"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@repo/ui/components/dropdown-menu";
import { TOOLBAR_PILL_CLASS } from "./toolbar-pill";

/** The clients the observability mock has numbers for. */
const BRAND_OPTIONS = [
  { id: "tartine-bakery", name: "Tartine Bakery" },
  { id: "meow-meow-tweet", name: "Meow Meow Tweet" },
  { id: "don-angie", name: "Don Angie" },
  { id: "northbound-coffee", name: "Northbound Coffee" },
];

/** The toolbar's one filter: narrow every panel on this tab to a single client. */
export function FilterMenu({ brandId }: { brandId: string | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = BRAND_OPTIONS.find((b) => b.id === brandId) ?? null;

  function setBrand(id: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (id) params.set("brand", id);
    else params.delete("brand");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className={TOOLBAR_PILL_CLASS}>
          <Filter className="size-4" /> {active ? active.name : "Add filter"}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Brand</DropdownMenuLabel>
        {BRAND_OPTIONS.map((b) => (
          <DropdownMenuItem key={b.id} onSelect={() => setBrand(b.id)} aria-selected={b.id === brandId}>
            {b.name}
          </DropdownMenuItem>
        ))}
        {active && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => setBrand(null)}>Clear filter</DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
