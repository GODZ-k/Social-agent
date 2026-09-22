"use client";

import type { UseFormReturn } from "react-hook-form";
import type { Values } from "@/features/brand-kit/schema";
import { FieldGroup } from "@/features/brand-kit/field-group";
import { ColorList } from "@/features/brand-kit/color-list";
import { VoicePicker } from "@/features/brand-kit/voice-picker";
import { PlatformPicker } from "@/features/brand-kit/platform-picker";
import { Input, Textarea } from "@repo/ui/components/input";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/components/form";

/** The editable brand kit, shared by onboarding and Settings. The forms around it decide what saving means. */
export function BrandKitFields({ form, platformsHint }: { form: UseFormReturn<Values>; platformsHint: string }) {
  return (
    <div className="grid gap-9">
      <FieldGroup title="The business">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem><FormLabel>Business name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="industry" render={({ field }) => (
            <FormItem><FormLabel>Type of business</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <FormField control={form.control} name="tagline" render={({ field }) => (
          <FormItem><FormLabel>Tagline</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="summary" render={({ field }) => (
          <FormItem><FormLabel>What they do</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="audience" render={({ field }) => (
          <FormItem><FormLabel>Who it&apos;s for</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
      </FieldGroup>

      <FieldGroup title="How they sound">
        <FormField control={form.control} name="voice" render={({ field }) => (
          <FormItem>
            <FormLabel>Tone of voice</FormLabel>
            <VoicePicker value={field.value} onChange={field.onChange} />
            <FormMessage />
          </FormItem>
        )} />
      </FieldGroup>

      <FieldGroup title="How they look">
        <ColorList control={form.control} />
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField control={form.control} name="headingFont" render={({ field }) => (
            <FormItem><FormLabel>Heading typeface</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="bodyFont" render={({ field }) => (
            <FormItem><FormLabel>Body typeface</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
      </FieldGroup>

      <FieldGroup title="Where to publish">
        <FormField control={form.control} name="platforms" render={({ field }) => (
          <FormItem>
            <PlatformPicker value={field.value} onChange={field.onChange} />
            <FormDescription>{platformsHint}</FormDescription>
            <FormMessage />
          </FormItem>
        )} />
      </FieldGroup>
    </div>
  );
}
