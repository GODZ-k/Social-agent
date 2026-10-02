"use client";

import { useWatch, type UseFormReturn } from "react-hook-form";
import type { Values } from "@/features/brand-kit/schema";
import type { ScanSources } from "@/lib/types";
import { EditableCard, type CardControls } from "@/features/brand-kit/editable-card";
import { ColorList } from "@/features/brand-kit/color-list";
import { KvRow } from "@/features/brand-kit/kv-row";
import { Input } from "@repo/ui/components/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/components/form";

export function LooksCard({
  form,
  sources,
  ...card
}: { form: UseFormReturn<Values>; sources?: ScanSources } & CardControls) {
  const [colors, headingFont, bodyFont] = useWatch({ control: form.control, name: ["colors", "headingFont", "bodyFont"] });

  return (
    <EditableCard title="How you look" {...card}>
      {card.editing ? (
        <div className="grid gap-5">
          <ColorList control={form.control} />
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="headingFont"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Heading typeface</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bodyFont"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Body typeface</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      ) : (
        <div>
          <KvRow label="Colours" source={sources?.colors}>
            <div className="flex flex-wrap gap-x-3 gap-y-1.5">
              {colors.map((color) => (
                <span key={color.name} className="inline-flex items-center gap-1.5">
                  <span className="size-6 rounded-md ring-1 ring-border" style={{ background: color.hex }} />
                  <span className="type-label text-foreground">{color.name}</span>
                </span>
              ))}
            </div>
          </KvRow>
          <KvRow label="Typefaces">
            <span>
              <span className="font-medium">{headingFont}</span> for headings, <span className="font-medium">{bodyFont}</span> for text
            </span>
          </KvRow>
        </div>
      )}
    </EditableCard>
  );
}
