"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "../lib/utils";

interface TagInputProps {
  value: string[];
  onChange: (next: string[]) => void;
  /** Turns raw text into a tag, or returns null to reject it. Runs on every entry, typed or pasted. */
  normalize?: (raw: string) => string | null;
  max?: number;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

/**
 * Tags as removable chips with a text field at the end. Enter, space or a comma
 * commits what's typed; Backspace in an empty field removes the last tag; a
 * pasted list is split into separate tags.
 */
export function TagInput({ value, onChange, normalize = (raw) => raw.trim() || null, max = Infinity, placeholder, disabled, ...field }: TagInputProps) {
  const [draft, setDraft] = React.useState("");
  const full = value.length >= max;

  function commit(raw: string) {
    const next = [...value];
    for (const piece of raw.split(/[\s,]+/)) {
      const tag = normalize(piece);
      if (tag && next.length < max && !next.some((t) => t.toLowerCase() === tag.toLowerCase())) next.push(tag);
    }
    if (next.length !== value.length) onChange(next);
    setDraft("");
  }

  return (
    <div
      className={cn(
        "flex min-h-11 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-card p-1.5 transition-[border-color,box-shadow] duration-150 focus-within:border-primary focus-within:ring-4 focus-within:ring-ring/30",
        field["aria-invalid"] && "border-destructive",
        disabled && "opacity-60",
      )}
    >
      {value.map((tag) => (
        <span key={tag} className="inline-flex items-center gap-0.5 rounded-full bg-tint py-1 pr-1 pl-2.5 text-[0.8125rem] font-medium text-tint-foreground">
          {tag}
          {!disabled && (
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              onClick={() => onChange(value.filter((t) => t !== tag))}
              className="grid size-5 place-items-center rounded-full hover:bg-tint-strong"
            >
              <X className="size-3" />
            </button>
          )}
        </span>
      ))}
      <input
        {...field}
        value={draft}
        disabled={disabled || full}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " " || e.key === ",") {
            e.preventDefault();
            commit(draft);
          } else if (e.key === "Backspace" && !draft && value.length) {
            onChange(value.slice(0, -1));
          }
        }}
        onPaste={(e) => {
          e.preventDefault();
          commit(draft + e.clipboardData.getData("text"));
        }}
        onBlur={() => draft && commit(draft)}
        placeholder={full ? "" : placeholder}
        className="h-8 min-w-24 flex-1 bg-transparent px-2 text-[0.9375rem] outline-none placeholder:text-muted-foreground/80"
      />
    </div>
  );
}
