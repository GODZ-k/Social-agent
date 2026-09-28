"use client";

import * as React from "react";
import { cn } from "../lib/utils";

type CodeInputProps = Omit<React.ComponentProps<"input">, "value" | "onChange" | "maxLength" | "type"> & {
  value: string;
  onValueChange: (value: string) => void;
  length?: number;
};

/**
 * A one-time code drawn as separate boxes over ONE real input, so paste,
 * email and SMS autofill, password managers and screen readers all see a single
 * field. Digits only. Set `aria-invalid` to paint the boxes as an error.
 */
export function CodeInput({ value, onValueChange, length = 6, className, disabled, onFocus, onBlur, ...props }: CodeInputProps) {
  const [focused, setFocused] = React.useState(false);
  const digits = value.slice(0, length);
  const invalid = props["aria-invalid"] === true || props["aria-invalid"] === "true";
  const activeIndex = focused ? Math.min(digits.length, length - 1) : -1;
  const half = Math.ceil(length / 2);

  return (
    <div className={cn("relative", className)}>
      <input
        {...props}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]*"
        maxLength={length}
        value={digits}
        disabled={disabled}
        onChange={(event) => onValueChange(event.target.value.replace(/\D/g, "").slice(0, length))}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        className="absolute inset-0 z-10 size-full cursor-text text-base text-transparent caret-transparent opacity-0 outline-none disabled:cursor-not-allowed"
      />
      <div
        aria-hidden
        className="grid items-center gap-1.5 sm:gap-2"
        style={{ gridTemplateColumns: `repeat(${half}, minmax(0, 1fr)) 0.75rem repeat(${length - half}, minmax(0, 1fr))` }}
      >
        {Array.from({ length }, (_, index) => (
          <React.Fragment key={index}>
            {index === half && <span className="h-0.5 rounded-full bg-input" />}
            <CodeCell digit={digits[index] ?? ""} active={index === activeIndex} invalid={invalid} disabled={disabled} />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function CodeCell({ digit, active, invalid, disabled }: { digit: string; active: boolean; invalid: boolean; disabled?: boolean }) {
  return (
    <span
      data-active={active || undefined}
      data-invalid={invalid || undefined}
      data-disabled={disabled || undefined}
      className={cn(
        "grid h-13.5 place-items-center rounded-[0.875rem] bg-card font-display text-[1.375rem] font-semibold tabular-nums shadow-[0_0_0_1px_var(--input)] transition-shadow duration-150 motion-reduce:transition-none sm:h-15 sm:text-[1.625rem]",
        "data-[active]:shadow-[0_0_0_2px_var(--brand),0_0_0_6px_var(--tint-strong)]",
        "data-[invalid]:text-destructive data-[invalid]:shadow-[0_0_0_2px_var(--destructive)]",
        "data-[disabled]:bg-secondary data-[disabled]:text-muted-foreground data-[disabled]:shadow-none",
      )}
    >
      {digit || (active ? <span className="h-[1.6rem] w-[1.5px] animate-pulse bg-foreground motion-reduce:animate-none" /> : null)}
    </span>
  );
}
