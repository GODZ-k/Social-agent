"use client";

import { PLATFORMS } from "@/features/brand-kit/schema";
import { cn } from "@/lib/utils";
import { PLATFORM_LABEL, PlatformIcon } from "@repo/ui/components/social/platform";

type Picked = (typeof PLATFORMS)[number];

export function PlatformPicker({ value, onChange }: { value: Picked[]; onChange: (v: Picked[]) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      {PLATFORMS.map((p) => {
        const on = value.includes(p);
        return (
          <button
            key={p}
            type="button"
            role="checkbox"
            aria-checked={on}
            onClick={() => onChange(on ? value.filter((x) => x !== p) : [...value, p])}
            className={cn(
              "pressable flex flex-col items-start gap-3 rounded-lg p-3.5 text-left text-sm font-medium ring-1",
              on ? "bg-tint text-tint-foreground ring-primary" : "bg-card text-muted-foreground ring-border hover:text-foreground",
            )}
          >
            <PlatformIcon platform={p} className="size-5" />
            {PLATFORM_LABEL[p]}
          </button>
        );
      })}
    </div>
  );
}
