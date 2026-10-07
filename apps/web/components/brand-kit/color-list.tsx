"use client";

import { useFieldArray, type Control } from "react-hook-form";
import { Plus, X } from "lucide-react";
import { isValidHex } from "@/lib/utils";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { FormControl, FormField, FormItem, FormMessage } from "@repo/ui/components/form";

/** The only part of a form this editor touches. Both kit forms build `colors` from the same `brandColor`. */
interface ColorsForm {
  colors: { name: string; hex: string }[];
}

/**
 * The swatch editor, shared by the scan's brand kit and FL-1's manual capture. They differ only in
 * how many colours they allow and what they call the list, so both are props.
 *
 * Generic over the whole form so callers stay type-checked, with one cast inside: react-hook-form
 * cannot infer that `"colors"` is a field array on an unknown `T`, and narrowing it here is cheaper
 * than making every caller pass its own paths.
 */
export function ColorList<T extends ColorsForm>({
  control,
  max = 6,
  label = "Brand colours",
}: {
  control: Control<T>;
  max?: number;
  label?: string;
}) {
  // One cast at the boundary: inside, every field path is checked against `ColorsForm` concretely.
  const colorForm = control as unknown as Control<ColorsForm>;
  const colors = useFieldArray({ control: colorForm, name: "colors" });

  return (
    <div className="grid gap-2.5">
      <p className="text-[0.8125rem] font-medium leading-none">{label}</p>
      <p className="type-label -mt-1">The first colour is the one posts lead with.</p>
      <ul className="grid gap-2.5">
        {colors.fields.map((item, i) => (
          <li key={item.id} className="grid grid-cols-[auto_minmax(0,1fr)_7.5rem_auto] items-start gap-2.5">
            <FormField
              control={colorForm}
              name={`colors.${i}.hex`}
              render={({ field }) => (
                <label
                  className="relative size-11 shrink-0 cursor-pointer overflow-hidden rounded-md ring-1 ring-border"
                  style={{ background: isValidHex(field.value) ? field.value : "transparent" }}
                >
                  <span className="sr-only">Pick colour {i + 1}</span>
                  <input
                    type="color"
                    value={isValidHex(field.value) && field.value.length === 7 ? field.value : "#000000"}
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    className="absolute inset-0 size-full cursor-pointer opacity-0"
                  />
                </label>
              )}
            />
            <FormField
              control={colorForm}
              name={`colors.${i}.name`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input aria-label={`Colour ${i + 1} name`} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={colorForm}
              name={`colors.${i}.hex`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input aria-label={`Colour ${i + 1} hex value`} className="font-medium uppercase tabular-nums" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Remove colour ${i + 1}`}
              disabled={colors.fields.length <= 1}
              onClick={() => colors.remove(i)}
            >
              <X />
            </Button>
          </li>
        ))}
      </ul>
      {colors.fields.length < max && (
        <Button type="button" variant="secondary" size="sm" className="w-fit" onClick={() => colors.append({ name: "New colour", hex: "#888888" })}>
          <Plus /> Add a colour
        </Button>
      )}
    </div>
  );
}
