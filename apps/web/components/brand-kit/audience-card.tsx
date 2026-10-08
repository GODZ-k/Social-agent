"use client";

import { useWatch, type UseFormReturn } from "react-hook-form";
import type { Values } from "@/lib/forms/brand-kit";
import type { ScanSources } from "@/lib/types";
import { EditableCard } from "./editable-card";
import { KvRow } from "./kv-row";
import { Input } from "@repo/ui/components/input";
import { FormControl, FormField, FormItem, FormMessage } from "@repo/ui/components/form";
import type { CardControls } from "@/components/brand-kit/types";

/** "Who it's for": the one audience line every post is written to reach. */
export function AudienceCard({
  form,
  sources,
  ...card
}: { form: UseFormReturn<Values>; sources?: ScanSources } & CardControls) {
  const audience = useWatch({ control: form.control, name: "audience" });

  return (
    <EditableCard title="Who it's for" {...card}>
      {card.editing ? (
        <FormField
          control={form.control}
          name="audience"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : (
        <KvRow label="Your customers" source={sources?.audience}>
          {audience}
        </KvRow>
      )}
    </EditableCard>
  );
}
