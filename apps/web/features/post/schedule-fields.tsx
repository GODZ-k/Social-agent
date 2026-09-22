"use client";

import { format } from "date-fns";
import type { UseFormReturn } from "react-hook-form";
import { bestTimesFor } from "@/lib/best-times";
import type { Platform, Strategy } from "@/lib/types";
import { DatePicker } from "@repo/ui/components/date-picker";
import { TimePicker } from "@repo/ui/components/time-picker";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/components/form";
import { PLATFORM_LABEL } from "@repo/ui/components/social/platform";
import type { Values } from "./schema";

export function ScheduleFields({
  form,
  platform,
  strategy,
}: {
  form: UseFormReturn<Values>;
  platform: Platform;
  strategy: Strategy | null;
}) {
  return (
    <div className="grid grid-cols-2 items-start gap-3">
      <FormField control={form.control} name="date" render={({ field }) => (
        <FormItem>
          <FormLabel>Publish date</FormLabel>
          {/* Nothing can be scheduled in the past, so earlier days are unavailable. */}
          <FormControl><DatePicker value={field.value} onChange={field.onChange} min={format(new Date(), "yyyy-MM-dd")} /></FormControl>
          <FormMessage />
        </FormItem>
      )} />
      <FormField control={form.control} name="time" render={({ field }) => (
        <FormItem>
          <FormLabel>Publish time</FormLabel>
          <FormControl>
            <TimePicker
              value={field.value}
              onChange={field.onChange}
              suggestions={bestTimesFor(strategy ?? undefined, platform)}
              suggestionsLabel={`Best times for ${PLATFORM_LABEL[platform]}`}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />
    </div>
  );
}
