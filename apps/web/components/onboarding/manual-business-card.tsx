"use client";

import type { UseFormReturn } from "react-hook-form";
import type { ManualValues } from "@/lib/forms/manual-kit";
import { KitField } from "@/components/brand-kit/kit-field";
import { SuggestionChips } from "@/components/onboarding/suggestion-chips";
import { Panel } from "@repo/ui/components/states";

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
        <KitField control={form.control} name="name" label="Business name" placeholder="Meow Meow Tweet" />
        <KitField
          control={form.control}
          name="industry"
          label="Type of business"
          optional
          placeholder="For example: bakery, yoga studio, online shop"
          hint={
            <SuggestionChips
              label="Common:"
              options={INDUSTRY_SUGGESTIONS}
              onPick={(v) => form.setValue("industry", v, { shouldDirty: true })}
            />
          }
        />
        <KitField
          control={form.control}
          name="summary"
          label="What you do"
          rows={3}
          placeholder="What you sell or offer, and what makes it yours. One or two sentences."
          hint={<p className="type-label">The agent uses this in every caption, so say it the way you&apos;d tell a customer.</p>}
        />
        <KitField
          control={form.control}
          name="website"
          label="Website"
          optional
          placeholder="yourbusiness.com"
          hint={
            website && (
              <p className="type-label">
                We couldn&apos;t read it just now. It stays on your kit, and you can ask for a new read in Settings.
              </p>
            )
          }
        />
        <KitField control={form.control} name="tagline" label="Tagline" optional placeholder="One line you're known for" />
      </div>
    </Panel>
  );
}
