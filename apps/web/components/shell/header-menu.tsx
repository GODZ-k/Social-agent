"use client";

import { createContext, use, useState } from "react";
import Link from "next/link";
import { Slot } from "radix-ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { Sheet } from "@repo/ui/components/sheet";
import { useIsDesktop } from "@repo/ui/hooks/use-media-query";
import { cn } from "@/lib/utils";

/*
 * A header menu is one compound component with two surfaces: a menu anchored
 * under its trigger on wide screens, a bottom sheet with thumb-sized rows on
 * phones. Its parts read which surface they are in from context, so each menu
 * is written once.
 */

type Surface = "menu" | "sheet";

const HeaderMenuContext = createContext<{ surface: Surface; close: () => void } | null>(null);

function useHeaderMenu() {
  const context = use(HeaderMenuContext);
  if (!context) throw new Error("Header menu parts must be inside <HeaderMenu>.");
  return context;
}

export function useHeaderMenuSurface() {
  return useHeaderMenu().surface;
}

export function HeaderMenu({
  title,
  trigger,
  align = "start",
  onOpen,
  children,
}: {
  /** The menu's accessible name, and the sheet's heading on phones. */
  title: string;
  trigger: React.ReactElement;
  align?: "start" | "end";
  /** Runs when the menu opens, for fetching whatever a row is about to need. */
  onOpen?: () => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const isDesktop = useIsDesktop();
  const close = () => setOpen(false);

  function change(next: boolean) {
    if (next) onOpen?.();
    setOpen(next);
  }

  if (isDesktop) {
    return (
      <HeaderMenuContext value={{ surface: "menu", close }}>
        <DropdownMenu open={open} onOpenChange={change}>
          <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
          <DropdownMenuContent
            align={align}
            aria-label={title}
            className="grid w-80 max-w-[calc(100vw-2rem)] gap-0.5 rounded-[1.375rem] p-1.5"
          >
            {children}
          </DropdownMenuContent>
        </DropdownMenu>
      </HeaderMenuContext>
    );
  }

  return (
    <HeaderMenuContext value={{ surface: "sheet", close }}>
      <Slot.Root aria-haspopup="dialog" aria-expanded={open} onClick={() => change(true)}>
        {trigger}
      </Slot.Root>
      <Sheet open={open} onOpenChange={change} title={title}>
        <div className="grid gap-0.5 pb-[env(safe-area-inset-bottom)]">{children}</div>
      </Sheet>
    </HeaderMenuContext>
  );
}

const itemClass = cn(
  "flex min-h-11 w-full items-center gap-3 rounded-[0.875rem] px-3 py-1.5 text-left text-sm outline-none",
  "hover:bg-accent focus-visible:bg-accent data-highlighted:bg-accent aria-[current=true]:bg-tint",
  "[&_svg]:size-[1.125rem] [&_svg]:shrink-0 [&_svg]:text-muted-foreground",
  // Thumb-sized on phones: at least 52px per row.
  "max-md:min-h-13 max-md:text-[0.9375rem]",
);

type ItemAction = { href: string; onSelect?: never } | { onSelect: () => void; href?: never };

/** A row that navigates (href) or acts (onSelect), then closes the menu. */
export function HeaderMenuItem({
  current,
  className,
  children,
  ...action
}: ItemAction & { current?: boolean; className?: string; children: React.ReactNode }) {
  const { surface, close } = useHeaderMenu();
  const shared = { className: cn(itemClass, className), "aria-current": current ? ("true" as const) : undefined };

  if (surface === "menu") {
    if (action.href !== undefined) {
      return (
        <DropdownMenuItem asChild {...shared}>
          <Link href={action.href}>{children}</Link>
        </DropdownMenuItem>
      );
    }
    return (
      <DropdownMenuItem onSelect={action.onSelect} {...shared}>
        {children}
      </DropdownMenuItem>
    );
  }

  if (action.href !== undefined) {
    return (
      <Link href={action.href} onClick={close} {...shared}>
        {children}
      </Link>
    );
  }
  const select = action.onSelect;
  return (
    <button
      type="button"
      onClick={() => {
        close();
        select();
      }}
      {...shared}
    >
      {children}
    </button>
  );
}

/** The item's text: a name and an optional second line. */
export function HeaderMenuItemText({ title, detail }: { title: string; detail?: string }) {
  return (
    <span className="grid min-w-0 flex-1 leading-tight">
      <span className="truncate font-medium">{title}</span>
      {detail && <span className="truncate text-xs text-muted-foreground">{detail}</span>}
    </span>
  );
}

export function HeaderMenuSeparator() {
  const { surface } = useHeaderMenu();
  if (surface === "menu") return <DropdownMenuSeparator className="mx-2 my-1" />;
  return <hr className="mx-2 my-1 border-border" />;
}

/** A group heading. The sheet already has the menu's title as its heading, so it is left out there. */
export function HeaderMenuLabel({ children }: { children: React.ReactNode }) {
  const { surface } = useHeaderMenu();
  if (surface === "sheet") return null;
  return <DropdownMenuLabel className="px-3 pt-2 pb-1 text-xs font-medium">{children}</DropdownMenuLabel>;
}
