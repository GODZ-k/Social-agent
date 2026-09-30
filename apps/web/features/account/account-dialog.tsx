"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, UserRound } from "lucide-react";
import { loadAccount } from "@/lib/api/actions";
import type { AccountDetails, AccountView } from "@/lib/types";
import { Modal } from "@repo/ui/components/modal";
import { cn } from "@repo/ui/lib/utils";
import { ProfileSkeleton, SecuritySkeleton } from "./account-skeleton";
import { ProfileTab } from "./profile-tab";
import { SecurityTab } from "./security-tab";

const TABS = [
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "security", label: "Security", icon: ShieldCheck },
] as const;

type TabId = (typeof TABS)[number]["id"];

/** Reads the account once, when the dialog first mounts. It only mounts when someone opens it. */
function useAccount() {
  const [view, setView] = useState<AccountView | null>(null);

  useEffect(() => {
    let live = true;
    loadAccount().then((result) => {
      if (live && result.ok) setView(result.data);
    });
    return () => {
      live = false;
    };
  }, []);

  return [view, setView] as const;
}

/**
 * The account, as a card over whatever page you were on. It has no route: the
 * header opens it, Escape and the close button end it, and the page behind never
 * moves. Its own two panes are the layout Clerk's account component uses, drawn
 * in this app's tokens.
 *
 * `account-menu.tsx` loads this file only once someone opens it, so none of what
 * it pulls in — the two panes, their forms, the two-factor read — is part of the
 * JavaScript every other page downloads.
 */
export function AccountDialog({ open, onOpenChange, isAdmin }: { open: boolean; onOpenChange: (open: boolean) => void; isAdmin: boolean }) {
  const [tab, setTab] = useState<TabId>("profile");
  const [view, setView] = useAccount();

  function onSaved(details: AccountDetails) {
    setView((current) => (current ? { ...current, details } : current));
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Your account"
      description="Your details and how you sign in."
      className="sm:h-[min(40rem,100%)]"
    >
      <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
        <nav
          aria-label="Your account"
          className="flex shrink-0 gap-1 border-b border-border px-4 pt-5 pb-0 sm:w-56 sm:flex-col sm:border-r sm:border-b-0 sm:px-3 sm:py-5"
        >
          <p className="type-heading hidden px-2 pb-3 sm:block">Account</p>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              aria-current={tab === id ? "page" : undefined}
              className={cn(
                "pressable flex items-center gap-2.5 rounded-lg border-b-2 px-2.5 py-2 text-sm font-medium sm:border-b-0",
                tab === id
                  ? "border-primary text-foreground sm:border-transparent sm:bg-secondary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              {label}
            </button>
          ))}
        </nav>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-4 pb-6 sm:px-7">
          <Pane tab={tab} view={view} isAdmin={isAdmin} onSaved={onSaved} onLeave={() => onOpenChange(false)} />
        </div>
      </div>
    </Modal>
  );
}

/** The selected pane, or its skeleton while the read is still in flight. */
function Pane({
  tab,
  view,
  isAdmin,
  onSaved,
  onLeave,
}: {
  tab: TabId;
  view: AccountView | null;
  isAdmin: boolean;
  onSaved: (details: AccountDetails) => void;
  onLeave: () => void;
}) {
  if (tab === "profile") {
    if (!view) return <ProfileSkeleton />;
    return <ProfileTab details={view.details} onSaved={onSaved} />;
  }
  if (!view) return <SecuritySkeleton />;
  return (
    <SecurityTab
      passwordChangedAt={view.passwordChangedAt}
      sessions={view.sessions}
      isAdmin={isAdmin}
      onLeave={onLeave}
    />
  );
}
