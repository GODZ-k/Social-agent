"use client";

import { useTransition } from "react";
import { LogOut, UserCog } from "lucide-react";
import { signOut } from "@/lib/auth/actions";
import { HeaderMenu, HeaderMenuItem, HeaderMenuItemText, HeaderMenuSeparator } from "./header-menu";
import { ThemeChoice } from "./theme-choice";
import { AccountAvatar } from "./account-avatar";

/** Who is signed in, their account, the theme and signing out. The theme lives here, not in the bar. */
export function AccountMenu({
  name,
  email,
  backToId,
}: {
  name: string;
  email: string;
  /** The brand this menu is opened from, if any, so the account page can link back to it. */
  backToId?: string;
}) {
  const [signingOut, startSignOut] = useTransition();

  const trigger = (
    <button
      type="button"
      aria-label={`Your account, ${name}`}
      className="pressable grid size-9 shrink-0 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring aria-expanded:[&>span]:ring-2 aria-expanded:[&>span]:ring-primary aria-expanded:[&>span]:ring-offset-2 aria-expanded:[&>span]:ring-offset-card"
    >
      <AccountAvatar name={name} className="size-8 text-xs" />
    </button>
  );

  return (
    <HeaderMenu title="Your account" trigger={trigger} align="end">
      <div className="flex items-center gap-3 px-3 pt-2.5 pb-3">
        <AccountAvatar name={name} className="size-10 text-sm" />
        <div className="grid min-w-0 leading-snug">
          <span className="truncate text-[0.9375rem] font-semibold">{name}</span>
          <span className="truncate text-[0.8125rem] text-muted-foreground">{email}</span>
        </div>
      </div>
      <HeaderMenuSeparator />
      <HeaderMenuItem href={backToId ? `/account?from=${backToId}` : "/account"}>
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
  );
}
