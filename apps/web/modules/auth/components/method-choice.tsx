"use client";

import { KeyRound, Smartphone, type LucideIcon } from "lucide-react";
import { Badge } from "@repo/ui/components/badge";
import type { TwoFactorMethodKind } from "@/lib/auth/types";

const METHODS: Record<TwoFactorMethodKind, { icon: LucideIcon; title: string; body: string; recommended: boolean }> = {
  passkey: {
    icon: KeyRound,
    title: "Passkey",
    body: "Use your fingerprint, face or device PIN. Nothing to type, and it can't be phished.",
    recommended: true,
  },
  authenticator_app: {
    icon: Smartphone,
    title: "Authenticator app",
    body: "Google Authenticator, 1Password, Authy or similar shows a new 6-digit code every 30 seconds.",
    recommended: false,
  },
};

/** Two real radios, each drawn as a whole card you can click. Only the methods the provider supports appear. */
export function MethodChoice({
  methods,
  value,
  onValueChange,
}: {
  methods: readonly TwoFactorMethodKind[];
  value: TwoFactorMethodKind;
  onValueChange: (method: TwoFactorMethodKind) => void;
}) {
  return (
    <fieldset className="grid min-w-0 gap-3">
      <legend className="mb-1.75 text-sm font-medium">Choose how you&apos;ll confirm it&apos;s you</legend>
      {methods.map((kind) => {
        const { icon: Icon, title, body, recommended } = METHODS[kind];
        return (
          <label
            key={kind}
            className="relative grid cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 rounded-[1.125rem] bg-card p-4 shadow-[0_0_0_1px_var(--input)] transition-shadow has-checked:shadow-[0_0_0_2px_var(--brand),0_0_0_6px_var(--tint-strong)] has-focus-visible:outline-2 has-focus-visible:outline-offset-4 has-focus-visible:outline-primary motion-reduce:transition-none sm:gap-3.5 sm:px-4.5"
          >
            <input type="radio" name="method" value={kind} checked={value === kind} onChange={() => onValueChange(kind)} className="peer sr-only" />
            <span className="grid size-10 place-items-center rounded-[0.875rem] bg-tint text-tint-foreground">
              <Icon className="size-5" aria-hidden />
            </span>
            <span>
              <span className="flex flex-wrap items-center gap-x-2 gap-y-1 font-semibold">
                {title}
                {recommended ? <Badge variant="tint">Recommended</Badge> : null}
              </span>
              <span className="mt-0.75 block text-sm leading-[1.45] text-muted-foreground">{body}</span>
            </span>
            <span aria-hidden className="mt-0.5 size-5 rounded-full bg-card shadow-[inset_0_0_0_1.5px_var(--input)] peer-checked:shadow-[inset_0_0_0_5.5px_var(--brand)]" />
          </label>
        );
      })}
    </fieldset>
  );
}
