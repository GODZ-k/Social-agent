"use client";

import { Check } from "lucide-react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import { PLATFORMS } from "@/lib/forms/brand-kit";
import { Panel } from "@repo/ui/components/states";
import { PLATFORM_LABEL, PlatformIcon } from "@repo/ui/components/social/platform";
import { cn } from "@/lib/utils";

type KitPlatform = (typeof PLATFORMS)[number];

/** The only part of a form this card touches. */
interface PlatformsForm {
  platforms: KitPlatform[];
}

/**
 * "Where should we post?": tap a row to include or drop it. No Edit toggle.
 *
 * Shared by the scan's brand kit and FL-1's manual capture. They differ only in the line under each
 * platform's name — the scan shows the handle it found, FL-1 explains what the platform is for — so
 * that line is a prop.
 *
 * Generic over the whole form so callers stay type-checked, with one cast inside; see `ColorList`
 * for the same reason.
 */
export function PlatformsCard<T extends PlatformsForm>({
  form,
  title,
  hint,
  note,
}: {
  form: UseFormReturn<T>;
  title: string;
  hint: string;
  /** The line under a platform's name, given whether it is currently in the plan. */
  note: (platform: KitPlatform, on: boolean) => string;
}) {
  const platformForm = form as unknown as UseFormReturn<PlatformsForm>;
  const platforms = useWatch({ control: platformForm.control, name: "platforms" });
  const error = platformForm.formState.errors.platforms?.message;

  function toggle(platform: KitPlatform) {
    const on = platforms.includes(platform);
    const next = on ? platforms.filter((p) => p !== platform) : [...platforms, platform];
    platformForm.setValue("platforms", next, { shouldDirty: true, shouldValidate: true });
  }

  return (
    <Panel>
      <div className="mb-3.5">
        <h2 className="type-heading">{title}</h2>
        <p className="type-label mt-1">{hint}</p>
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
                <span className="type-label truncate">{note(platform, on)}</span>
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

/** What the scan found linked on the site, falling back to whether the platform is in the plan. */
export function signalNote(signals: Partial<Record<KitPlatform, { handle: string; source: string }>> | undefined) {
  return (platform: KitPlatform, on: boolean) => {
    const signal = signals?.[platform];
    if (signal) return `${signal.handle}, ${signal.source}`;
    return on ? "In your plan" : "Not in your plan";
  };
}

/** What each platform is for, when there is no scan to quote (FL-1). */
const PLATFORM_PURPOSE: Record<KitPlatform, string> = {
  instagram: "Where most small businesses start",
  facebook: "Posts to a Facebook Page",
  tiktok: "Short videos",
  linkedin: "For selling to other businesses",
};

export const purposeNote = (platform: KitPlatform) => PLATFORM_PURPOSE[platform];
