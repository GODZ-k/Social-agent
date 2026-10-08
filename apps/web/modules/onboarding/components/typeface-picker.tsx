"use client";

import { cn } from "@/lib/utils";

/** FL-1's three named starting pairs, shown in their own faces so the choice reads at a glance. */
export const TYPEFACE_OPTIONS = [
  { id: "clean", label: "Clean", heading: "Inter", body: "Inter", sample: "Inter for headings and text", stack: "Inter, system-ui, sans-serif" },
  { id: "warm", label: "Warm", heading: "Fraunces", body: "Karla", sample: "Fraunces for headings, Karla for text", stack: "Fraunces, Georgia, serif" },
  {
    id: "friendly",
    label: "Friendly",
    heading: "Poppins",
    body: "Nunito",
    sample: "Poppins for headings, Nunito for text",
    stack: "Poppins, system-ui, sans-serif",
  },
] as const;

export type TypefaceId = (typeof TYPEFACE_OPTIONS)[number]["id"];

export function TypefacePicker({ value, onChange }: { value: TypefaceId; onChange: (v: TypefaceId) => void }) {
  return (
    <div role="radiogroup" aria-label="Typeface" className="grid gap-2">
      {TYPEFACE_OPTIONS.map((option) => {
        const on = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(option.id)}
            className={cn("pressable flex items-center gap-3 rounded-xl p-3.5 text-left ring-1", on ? "bg-tint ring-primary" : "bg-card ring-border")}
          >
            <span
              className="grid size-11 shrink-0 place-items-center rounded-lg bg-card text-lg font-semibold ring-1 ring-border"
              style={{ fontFamily: option.stack }}
            >
              Aa
            </span>
            <span className="min-w-0">
              <span className="block font-medium">{option.label}</span>
              <span className="type-label block truncate">{option.sample}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
