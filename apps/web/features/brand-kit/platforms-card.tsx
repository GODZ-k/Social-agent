"use client";

import { Check } from "lucide-react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import { PLATFORMS, type Values } from "@/features/brand-kit/schema";
import type { PlatformSignal } from "@/lib/types";
import type { Platform } from "@social-agent/shared";
import { Panel } from "@repo/ui/components/states";
import { PLATFORM_LABEL, PlatformIcon } from "@repo/ui/components/social/platform";
import { cn } from "@/lib/utils";

/** "Where should we post?": the plan's platforms. No Edit toggle; tap a row to include or drop it. */
export function PlatformsCard({
  form,
  title,
  hint,
  signals,
}: {
  form: UseFormReturn<Values>;
  title: string;
  hint: string;
  signals?: Partial<Record<Platform, PlatformSignal>>;
}) {
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
        <h2 className="type-heading">{title}</h2>
        <p className="type-label mt-1">{hint}</p>
      </div>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {PLATFORMS.map((platform) => {
          const on = platforms.includes(platform);
          const signal = signals?.[platform];
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
                <span className="type-label truncate">
                  {signal ? `${signal.handle}, ${signal.source}` : on ? "In your plan" : "Not in your plan"}
                </span>
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
