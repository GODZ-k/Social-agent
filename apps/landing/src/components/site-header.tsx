"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Sheet } from "@repo/ui/components/sheet";
import { ThemeMenu } from "@repo/ui/components/theme-menu";
import { cn } from "@repo/ui/lib/utils";
import { Logo } from "./logo";
import { NAV, signInUrl, signUpUrl } from "@/lib/site";

// The header has room for four links; the rest are reachable from the footer and the phone menu.
const MENU = [...NAV, { href: "/about", label: "About" }, { href: "/contact", label: "Contact" }];

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const isCurrent = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 md:px-5">
      <div className="material mx-auto flex h-14 max-w-5xl items-center gap-2 rounded-full pr-2 pl-4 md:gap-3">
        <Logo />
        <nav aria-label="Main" className="ml-3 flex items-center gap-0.5 max-md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isCurrent(item.href) ? "page" : undefined}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-foreground",
                isCurrent(item.href) ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1.5">
          <ThemeMenu />
          <Button variant="ghost" size="sm" asChild className="max-sm:hidden">
            <a href={signInUrl}>Sign in</a>
          </Button>
          <Button size="sm" asChild>
            <a href={signUpUrl()}>Get started</a>
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Menu" className="md:hidden" onClick={() => setMenuOpen(true)}>
            <Menu />
          </Button>
        </div>
      </div>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen} title="Menu">
        <nav aria-label="Menu" className="grid gap-1">
          {MENU.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              aria-current={isCurrent(item.href) ? "page" : undefined}
              className={cn(
                "pressable rounded-md px-3 py-3 text-base font-medium hover:bg-accent",
                isCurrent(item.href) && "bg-tint text-tint-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
          <a href={signInUrl} className="pressable rounded-md px-3 py-3 text-base font-medium text-muted-foreground hover:bg-accent">
            Sign in
          </a>
        </nav>
      </Sheet>
    </header>
  );
}
