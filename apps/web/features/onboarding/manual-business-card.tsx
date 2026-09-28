"use client";

import type { UseFormReturn } from "react-hook-form";
import type { ManualValues } from "@/features/onboarding/manual-kit-schema";
import { SuggestionChips } from "@/features/onboarding/suggestion-chips";
import { Panel } from "@repo/ui/components/states";
import { Input, Textarea } from "@repo/ui/components/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/components/form";

const INDUSTRY_SUGGESTIONS = ["Online shop", "Café or bakery", "Salon or spa", "Studio or class"] as const;

/** "The business": name, type, what they do, an optional site, and a tagline. */
export function ManualBusinessCard({ form }: { form: UseFormReturn<ManualValues> }) {
  const website = form.watch("website");

  return (
    <Panel>
      <div className="mb-3.5">
        <h2 className="type-heading">The business</h2>
        <p className="type-label mt-1">What it&apos;s called and what it does.</p>
      </div>
      <div className="grid gap-5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Meow Meow Tweet" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="industry"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center justify-between">
                Type of business
                <span className="font-normal text-muted-foreground">Optional</span>
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder="For example: bakery, yoga studio, online shop" />
              </FormControl>
              <SuggestionChips label="Common:" options={INDUSTRY_SUGGESTIONS} onPick={(v) => form.setValue("industry", v, { shouldDirty: true })} />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="summary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What you do</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} placeholder="What you sell or offer, and what makes it yours. One or two sentences." />
              </FormControl>
              <p className="type-label">The agent uses this in every caption, so say it the way you&apos;d tell a customer.</p>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center justify-between">
                Website
                <span className="font-normal text-muted-foreground">Optional</span>
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder="yourbusiness.com" />
              </FormControl>
              {website && (
                <p className="type-label">We couldn&apos;t read it just now. It stays on your kit, and you can ask for a new read in Settings.</p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tagline"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center justify-between">
                Tagline
                <span className="font-normal text-muted-foreground">Optional</span>
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder="One line you're known for" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Panel>
  );
}
