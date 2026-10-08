"use client";

import { ChevronsUpDown, LayoutGrid, Plus } from "lucide-react";
import type { SwitcherBrand } from "@/modules/shell/types";
import { BrandMark } from "@repo/ui/components/brand-mark";
import { BrandMenuRow } from "./brand-menu-row";
import { HeaderMenu, HeaderMenuItem, HeaderMenuItemText, HeaderMenuLabel, HeaderMenuSeparator } from "./header-menu";
import { routes } from "@/config/routes";

/** A client's brands: each with its colour, website and what waits for approval. */
export function BrandSwitcher({ current, brands }: { current: SwitcherBrand; brands: SwitcherBrand[] }) {
  const trigger = (
    <button
      type="button"
      aria-label={`${current.name}. Switch brand`}
      className="pressable flex h-10.5 min-w-0 items-center gap-2.5 rounded-full pr-2.5 pl-1.25 text-left hover:bg-accent aria-expanded:bg-accent max-[560px]:h-10 max-[560px]:gap-2 max-[560px]:pr-2"
    >
      <BrandMark name={current.name} color={current.accent} />
      <span className="truncate text-sm font-semibold">{current.name}</span>
      <ChevronsUpDown aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
    </button>
  );

  return (
    <HeaderMenu title="Your brands" trigger={trigger}>
      <HeaderMenuLabel>Your brands</HeaderMenuLabel>
      {brands.map((brand) => (
        <BrandMenuRow key={brand.id} brand={brand} detail={brand.site} current={brand.id === current.id} />
      ))}
      <HeaderMenuSeparator />
      <HeaderMenuItem href={routes.home}>
        <LayoutGrid aria-hidden />
        <HeaderMenuItemText title="All brands" />
      </HeaderMenuItem>
      <HeaderMenuItem href={routes.onboarding.start}>
        <Plus aria-hidden />
        <HeaderMenuItemText title="Add a brand" />
      </HeaderMenuItem>
    </HeaderMenu>
  );
}
