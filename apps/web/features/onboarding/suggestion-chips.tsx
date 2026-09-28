"use client";

/** A row of quick-fill suggestions under a text field ("Common:", "Start from:"). */
export function SuggestionChips({ label, options, onPick }: { label: string; options: readonly string[]; onPick: (value: string) => void }) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <span className="type-label">{label}</span>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onPick(option)}
          className="pressable rounded-full px-3 py-1 text-xs font-medium text-muted-foreground ring-1 ring-border hover:text-foreground"
        >
          {option}
        </button>
      ))}
    </div>
  );
}
