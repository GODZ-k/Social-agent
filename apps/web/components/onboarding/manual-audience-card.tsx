"use client";

import type { UseFormReturn } from "react-hook-form";
import type { ManualValues } from "@/lib/forms/manual-kit";
import { SuggestionChips } from "@/components/onboarding/suggestion-chips";
import { Panel } from "@repo/ui/components/states";
import { Textarea } from "@repo/ui/components/input";
import { FormControl, FormField, FormItem, FormMessage } from "@repo/ui/components/form";

const AUDIENCE_SUGGESTIONS = ["Locals nearby", "People who shop online", "Parents", "Other businesses"] as const;

/** "Who it's for": the one audience line every post is written to reach. */
export function ManualAudienceCard({ form }: { form: UseFormReturn<ManualValues> }) {
  return (
    <Panel>
      <div className="mb-3.5">
        <h2 className="type-heading">Who it&apos;s for</h2>
        <p className="type-label mt-1">Posts are written for these people.</p>
      </div>
      <FormField
        control={form.control}
        name="audience"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Textarea rows={2} {...field} placeholder="Who buys from you, and what they care about" />
            </FormControl>
            <SuggestionChips label="Start from:" options={AUDIENCE_SUGGESTIONS} onPick={(v) => form.setValue("audience", v, { shouldDirty: true })} />
            <p className="type-label">One sentence is enough, for example &ldquo;People 25 to 40 who read every ingredient label.&rdquo;</p>
            <FormMessage />
          </FormItem>
        )}
      />
    </Panel>
  );
}
