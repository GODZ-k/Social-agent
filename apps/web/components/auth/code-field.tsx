"use client";

import { CodeInput } from "@repo/ui/components/code-input";
import { FieldNote } from "./field-note";

/** The labelled six-box code input with its hint or error underneath. */
export function CodeField({
  value,
  onValueChange,
  message,
  invalid,
  disabled,
  autoFocus,
}: {
  value: string;
  onValueChange: (value: string) => void;
  message?: React.ReactNode;
  invalid?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
}) {
  return (
    <div className="grid gap-1.75">
      <label htmlFor="code" className="text-sm font-medium">
        6-digit code
      </label>
      <CodeInput
        id="code"
        name="code"
        value={value}
        onValueChange={onValueChange}
        aria-invalid={invalid || undefined}
        aria-describedby={message ? "code-msg" : undefined}
        disabled={disabled}
        autoFocus={autoFocus}
      />
      {message ? (
        <FieldNote id="code-msg" error={invalid}>
          {message}
        </FieldNote>
      ) : null}
    </div>
  );
}
