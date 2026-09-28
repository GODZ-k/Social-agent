"use client";

import type { UseFormReturn } from "react-hook-form";
import type { ManualValues } from "@/features/onboarding/manual-kit-schema";
import { ManualColorList } from "@/features/onboarding/manual-color-list";
import { TypefacePicker } from "@/features/onboarding/typeface-picker";
import { Panel } from "@repo/ui/components/states";
import { FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/components/form";

/** "How you look": the colours and typeface every post picture carries. */
export function ManualLooksCard({ form }: { form: UseFormReturn<ManualValues> }) {
  return (
    <Panel>
      <div className="mb-3.5">
        <h2 className="type-heading">How you look</h2>
        <p className="type-label mt-1">The colours and typefaces your post pictures use.</p>
      </div>
      <div className="grid gap-5">
        <ManualColorList control={form.control} />
        <FormField
          control={form.control}
          name="typeface"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Typeface</FormLabel>
              <TypefacePicker value={field.value} onChange={field.onChange} />
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Panel>
  );
}
