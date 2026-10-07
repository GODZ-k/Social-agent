"use client";

/** The "I saved them" box that unlocks the button after backup codes are shown. */
export function SavedCodesCheck({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (checked: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 text-sm leading-[1.45]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onCheckedChange(event.target.checked)}
        className="mt-0.5 size-5 shrink-0 cursor-pointer accent-primary"
      />
      <span>
        I saved my backup codes
        <small className="block text-[0.8125rem] text-muted-foreground">Somewhere safe that isn&apos;t this computer, like a password manager.</small>
      </span>
    </label>
  );
}
