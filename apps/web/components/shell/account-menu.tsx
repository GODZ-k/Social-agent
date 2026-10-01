"use client";

import { useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { LogOut, UserCog } from "lucide-react";
import { signOut } from "@/lib/auth/actions";
import type { Viewer } from "@/lib/types";
import { HeaderMenu, HeaderMenuItem, HeaderMenuItemText, HeaderMenuSeparator } from "./header-menu";
import { ThemeChoice } from "./theme-choice";
import { AccountAvatar } from "@repo/ui/components/account-avatar";

/**
 * The account dialog is in every header but wanted on almost no page load, and it
 * is the heaviest thing here: two panes, a form, and the two-factor read. Loading
 * it on demand keeps all of that out of the JavaScript every page downloads.
 * `ssr: false` because it only ever renders from a click.
 */
const loadAccountDialog = () => import("@/features/account/account-dialog");
const AccountDialog = dynamic(() => loadAccountDialog().then((m) => m.AccountDialog), { ssr: false });

/** Who is signed in, their account, the theme and signing out. The theme lives here, not in the bar. */
export function AccountMenu({ viewer }: { viewer: Viewer }) {
  const [signingOut, startSignOut] = useTransition();
  const [accountOpen, setAccountOpen] = useState(false);
  // Stays true after the first open so the dialog can play its closing animation.
  const [accountUsed, setAccountUsed] = useState(false);

  function openAccount() {
    setAccountUsed(true);
    setAccountOpen(true);
  }

  const trigger = (
    <button
      type="button"
      aria-label={`Your account, ${viewer.name}`}
      className="pressable grid size-9 shrink-0 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring aria-expanded:[&>span]:ring-2 aria-expanded:[&>span]:ring-primary aria-expanded:[&>span]:ring-offset-2 aria-expanded:[&>span]:ring-offset-card"
    >
      <AccountAvatar name={viewer.name} className="size-8 text-xs" />
    </button>
  );

  return (
    <>
      {/* Fetch the dialog while the menu is open, so the click that opens it has nothing left to wait for. */}
      <HeaderMenu title="Your account" trigger={trigger} align="end" onOpen={loadAccountDialog}>
        <div className="flex items-center gap-3 px-3 pt-2.5 pb-3">
          <AccountAvatar name={viewer.name} className="size-10 text-sm" />
          <div className="grid min-w-0 leading-snug">
            <span className="truncate text-[0.9375rem] font-semibold">{viewer.name}</span>
            <span className="truncate text-[0.8125rem] text-muted-foreground">{viewer.email}</span>
          </div>
        </div>
        <HeaderMenuSeparator />
        {/* Opens over the page it was called from: the account has no route of its own. */}
        <HeaderMenuItem onSelect={openAccount}>
          <UserCog aria-hidden />
          <HeaderMenuItemText title="Manage account" detail="Name, email, password and sign-in" />
        </HeaderMenuItem>
        <ThemeChoice />
        <HeaderMenuSeparator />
        <HeaderMenuItem onSelect={() => startSignOut(() => signOut())}>
          <LogOut aria-hidden />
          <HeaderMenuItemText title={signingOut ? "Signing out…" : "Sign out"} />
        </HeaderMenuItem>
      </HeaderMenu>
      {accountUsed && <AccountDialog open={accountOpen} onOpenChange={setAccountOpen} isAdmin={viewer.role === "admin"} />}
    </>
  );
}
