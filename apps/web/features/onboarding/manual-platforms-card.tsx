"use client";

import { Check } from "lucide-react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import { PLATFORMS } from "@/features/brand-kit/schema";
import type { ManualValues } from "@/features/onboarding/manual-kit-schema";
import { PLATFORM_LABEL, PlatformIcon } from "@repo/ui/components/social/platform";
import { Panel } from "@repo/ui/components/states";
import { cn } from "@/lib/utils";

const PLATFORM_HINT: Record<(typeof PLATFORMS)[number], string> = {
  instagram: "Where most small businesses start",
  facebook: "Posts to a Facebook Page",
  tiktok: "Short videos",
  linkedin: "For selling to other businesses",
};

/** "Where should we post?": platform cards, each explaining what it's for, not a bare toggle. */
export function ManualPlatformsCard({ form }: { form: UseFormReturn<ManualValues> }) {
  const platforms = useWatch({ control: form.control, name: "platforms" });
  const error = form.formState.errors.platforms?.message;

  function toggle(platform: (typeof PLATFORMS)[number]) {
    const on = platforms.includes(platform);
    const next = on ? platforms.filter((p) => p !== platform) : [...platforms, platform];
    form.setValue("platforms", next, { shouldDirty: true, shouldValidate: true });
  }

  return (
    <Panel>
      <div className="mb-3.5">
        <h2 className="type-heading">Where should we post?</h2>
        <p className="type-label mt-1">Pick at least one. You connect them in the next step.</p>
      </div>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {PLATFORMS.map((platform) => {
          const on = platforms.includes(platform);
          return (
            <button
              key={platform}
              type="button"
              role="checkbox"
              aria-checked={on}
              onClick={() => toggle(platform)}
              className="pressable flex items-center gap-3 rounded-2xl bg-card p-3.5 text-left ring-1 ring-border"
            >
              <PlatformIcon platform={platform} className="size-5 shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{PLATFORM_LABEL[platform]}</span>
                <span className="type-label truncate">{PLATFORM_HINT[platform]}</span>
              </span>
              <span
                className={cn(
                  "grid size-5 shrink-0 place-items-center rounded-md ring-1 ring-inset",
                  on ? "bg-primary text-primary-foreground ring-primary" : "ring-border",
                )}
              >
                {on && <Check className="size-3" strokeWidth={3} />}
              </span>
            </button>
          );
        })}
      </div>
      {error && <p className="mt-2.5 text-sm text-destructive">{error}</p>}
    </Panel>
  );
}
