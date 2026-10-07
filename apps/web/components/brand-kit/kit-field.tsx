"use client";

import type { Control, FieldValues, Path } from "react-hook-form";
import { Input, Textarea } from "@repo/ui/components/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/components/form";

/** Input attributes a form field may need to set; forwarded to the input, not the textarea. */
type InputAttrs = Pick<React.ComponentProps<"input">, "type" | "autoComplete" | "autoFocus" | "inputMode" | "readOnly">;

/**
 * One labelled text field in a form, with its validation message.
 *
 * Every kit card and dialog was spelling this same twelve-line `FormField` block out per field;
 * they now pass the parts that differ. `rows` makes it a textarea, since a summary and a business
 * name are the same field with different room, not two kinds of field.
 *
 * `type`, `autoComplete`, `autoFocus`, `inputMode` and `readOnly` pass straight through, because
 * dropping one silently changes what a field is — a missing `type="password"` would show a secret.
 */
export function KitField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  className,
  rows,
  hint,
  optional = false,
  ...inputAttrs
}: {
  control: Control<T>;
  name: Path<T>;
  /** Left out where the card's own heading already names the field. */
  label?: string;
  placeholder?: string;
  className?: string;
  /** Set to render a textarea this many rows tall instead of a single-line input. */
  rows?: number;
  /** Help text or chips under the control, above the validation message. */
  hint?: React.ReactNode;
  /** Marks the field optional at the end of its label row. */
  optional?: boolean;
} & InputAttrs) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel className={optional ? "flex items-center justify-between" : undefined}>
              {label}
              {optional && <span className="font-normal text-muted-foreground">Optional</span>}
            </FormLabel>
          )}
          <FormControl>
            {rows ? (
              <Textarea rows={rows} placeholder={placeholder} {...field} />
            ) : (
              <Input placeholder={placeholder} {...inputAttrs} {...field} />
            )}
          </FormControl>
          {hint}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
