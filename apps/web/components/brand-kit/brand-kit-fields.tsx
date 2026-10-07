"use client";

import type { UseFormReturn } from "react-hook-form";
import type { Values } from "@/lib/forms/brand-kit";
import { FieldGroup } from "@/components/brand-kit/field-group";
import { ColorList } from "@/components/brand-kit/color-list";
import { KitField } from "@/components/brand-kit/kit-field";
import { VoicePicker } from "@/components/brand-kit/voice-picker";
import { PlatformPicker } from "@/components/brand-kit/platform-picker";
import { FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/components/form";

/** The editable brand kit, shared by onboarding and Settings. The forms around it decide what saving means. */
export function BrandKitFields({ form, platformsHint }: { form: UseFormReturn<Values>; platformsHint: string }) {
  return (
    <div className="grid gap-9">
      <FieldGroup title="The business">
        <div className="grid gap-5 sm:grid-cols-2">
          <KitField control={form.control} name="name" label="Business name" />
          <KitField control={form.control} name="industry" label="Type of business" />
        </div>
        <KitField control={form.control} name="tagline" label="Tagline" />
        <KitField control={form.control} name="summary" label="What they do" rows={3} />
        <KitField control={form.control} name="audience" label="Who it's for" />
      </FieldGroup>

      <FieldGroup title="How they sound">
        <FormField
          control={form.control}
          name="voice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tone of voice</FormLabel>
              <VoicePicker value={field.value} onChange={field.onChange} />
              <FormMessage />
            </FormItem>
          )}
        />
      </FieldGroup>

      <FieldGroup title="How they look">
        <ColorList control={form.control} />
        <div className="grid gap-5 sm:grid-cols-2">
          <KitField control={form.control} name="headingFont" label="Heading typeface" />
          <KitField control={form.control} name="bodyFont" label="Body typeface" />
        </div>
      </FieldGroup>

      <FieldGroup title="Where to publish">
        <FormField
          control={form.control}
          name="platforms"
          render={({ field }) => (
            <FormItem>
              <PlatformPicker value={field.value} onChange={field.onChange} />
              <FormDescription>{platformsHint}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </FieldGroup>
    </div>
  );
}
