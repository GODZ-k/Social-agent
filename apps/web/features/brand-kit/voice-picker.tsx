"use client";

import { useState } from "react";
import { VOICE_SUGGESTIONS } from "@/features/brand-kit/schema";
import { cn } from "@/lib/utils";

export function VoicePicker({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [draft, setDraft] = useState("");
  const options = [...new Set([...value, ...VOICE_SUGGESTIONS])];

  function addDraft() {
    const word = draft.trim();
    if (word && !value.some((v) => v.toLowerCase() === word.toLowerCase())) onChange([...value, word]);
    setDraft("");
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((word) => {
        const on = value.includes(word);
        return (
          <button
            key={word}
            type="button"
            role="checkbox"
            aria-checked={on}
            onClick={() => onChange(on ? value.filter((v) => v !== word) : [...value, word])}
            className={cn(
              "pressable rounded-full px-3.5 py-1.5 text-sm font-medium ring-1",
              on ? "bg-primary text-primary-foreground ring-primary" : "bg-card text-muted-foreground ring-border hover:text-foreground",
            )}
          >
            {word}
          </button>
        );
      })}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            addDraft();
          }
        }}
        onBlur={addDraft}
        placeholder="Add your own"
        aria-label="Add your own tone word"
        className="h-[2.125rem] w-32 rounded-full bg-transparent px-3.5 text-sm ring-1 ring-border outline-none ring-inset placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-primary"
      />
    </div>
  );
}
