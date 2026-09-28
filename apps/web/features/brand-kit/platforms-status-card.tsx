"use client";

import type { ReactNode } from "react";
import { Check } from "lucide-react";
import Link from "next/link";
import { useWatch, type UseFormReturn } from "react-hook-form";
import type { Platform } from "@social-agent/shared";
import { PLATFORMS, type Values } from "@/features/brand-kit/schema";
import type { SocialAccountRow } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Panel } from "@repo/ui/components/states";
import { PLATFORM_LABEL, PlatformIcon } from "@repo/ui/components/social/platform";

type Tone = "muted" | "success" | "warning";

/** What a row says under the platform name: the plan, and, when it's in the plan, its Social accounts state. */
function statusFor(brandId: string, inPlan: boolean, account?: SocialAccountRow): { tone: Tone; text: ReactNode } {
  if (!inPlan) return { tone: "muted", text: "Not in your plan" };
  if (account?.state === "connected") return { tone: "success", text: `Connected as ${account.handle}` };
  const expired = account?.state === "expired";
  return {
    tone: "warning",
    text: (
      <>
        {expired ? "Access expired." : "Not connected yet."}{" "}
        <Link href={`/c/${brandId}/settings?tab=accounts`} className="underline underline-offset-2">
          {expired ? "Reconnect" : "Connect it"}
        </Link>
      </>
    ),
  };
}

/**
 * "Where to post" (S13): the plan's platforms, each showing its Social accounts connection state.
 * No Edit toggle; tapping a row's box includes or drops it and saves right away.
 */
export function PlatformsStatusCard({
  form,
  brandId,
  accounts,
  onToggle,
}: {
  form: UseFormReturn<Values>;
  brandId: string;
  accounts: SocialAccountRow[];
  onToggle: (platform: Platform) => void;
}) {
  const platforms = useWatch({ control: form.control, name: "platforms" });

  return (
    <Panel>
      <div className="mb-3.5">
        <h2 className="type-heading">Where to post</h2>
        <p className="type-label mt-1">The strategy plans posts for the ticked ones. Connections live in Social accounts.</p>
      </div>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {PLATFORMS.map((platform) => {
          const on = platforms.includes(platform);
          const account = accounts.find((a) => a.platform === platform);
          const status = statusFor(brandId, on, account);
          const label = PLATFORM_LABEL[platform];
          const toggleLabel = on ? `Remove ${label} from the posting plan` : `Add ${label} to the posting plan`;
          return (
            <div key={platform} className="flex items-center gap-3 rounded-2xl bg-card p-3.5 ring-1 ring-border">
              <PlatformIcon platform={platform} className="size-5 shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{label}</span>
                <span
                  className={cn(
                    "type-label block",
                    status.tone === "success" && "text-success",
                    status.tone === "warning" && "text-warning",
                  )}
                >
                  {status.text}
                </span>
              </span>
              <button
                type="button"
                role="checkbox"
                aria-checked={on}
                aria-label={toggleLabel}
                onClick={() => onToggle(platform)}
                className={cn(
                  "pressable grid size-5 shrink-0 place-items-center rounded-md ring-1 ring-inset",
                  on ? "bg-primary text-primary-foreground ring-primary" : "ring-border",
                )}
              >
                {on && <Check className="size-3" strokeWidth={3} />}
              </button>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
