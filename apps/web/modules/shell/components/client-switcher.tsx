"use client";

import { ChevronsUpDown, Plus, Users } from "lucide-react";
import type { SwitcherBrand } from "@/modules/shell/types";
import { BrandMark } from "@repo/ui/components/brand-mark";
import { BrandMenuRow } from "./brand-menu-row";
import { HeaderMenu, HeaderMenuItem, HeaderMenuItemText, HeaderMenuLabel, HeaderMenuSeparator } from "./header-menu";
import { ADMIN_CLIENTS_PATH } from "@/modules/shell/utils/admin-nav-items";
import { routes } from "@/config/routes";
import type { WorkspaceBase } from "@/config/routes";

/** The admin's switcher inside a brand: every client's brand, with whose it is. */
export function BrandSwitcher({
  current,
  brands,
  basePath = routes.brand.base,
}: {
  current: SwitcherBrand;
  brands: SwitcherBrand[];
  basePath?: WorkspaceBase;
}) {
  const owner = current.ownerName ? `${current.ownerName}’s brand` : null;
  const brandName = owner ? `${current.name}, ${owner}` : current.name;
  const trigger = (
    <button
      type="button"
      aria-label={`${brandName}. Switch client`}
      className="pressable flex h-10.5 min-w-0 items-center gap-2.5 rounded-full pr-2.5 pl-1.25 text-left hover:bg-accent aria-expanded:bg-accent max-[560px]:h-10 max-[560px]:gap-2 max-[560px]:pr-2"
    >
      <BrandMark name={current.name} color={current.accent} />
      <span className="grid min-w-0 leading-tight">
        <span className="truncate text-sm font-semibold">{current.name}</span>
        {owner && <span className="truncate text-[0.72rem] text-muted-foreground max-[560px]:hidden">{owner}</span>}
      </span>
      <ChevronsUpDown aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
    </button>
  );

  return (
    <HeaderMenu title="Switch client" trigger={trigger}>
      <HeaderMenuLabel>Switch client</HeaderMenuLabel>
      {brands.map((brand) => (
        <BrandMenuRow key={brand.id} brand={brand} detail={brand.ownerName ?? brand.site} current={brand.id === current.id} basePath={basePath} />
      ))}
      <HeaderMenuSeparator />
      <HeaderMenuItem href={ADMIN_CLIENTS_PATH}>
        <Users aria-hidden />
        <HeaderMenuItemText title="All clients" />
      </HeaderMenuItem>
      <HeaderMenuItem href={`${ADMIN_CLIENTS_PATH}?invite=1`}>
        <Plus aria-hidden />
        <HeaderMenuItemText title="Add a client" />
      </HeaderMenuItem>
    </HeaderMenu>
  );
}
