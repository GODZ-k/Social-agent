"use client";

import { Sparkles } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type { ManualValues } from "@/modules/onboarding/schemas/manual-kit";
import { VoicePicker } from "@/components/brand-kit/voice-picker";
import { Panel } from "@repo/ui/components/states";
import { FormField, FormItem, FormMessage } from "@repo/ui/components/form";

/** "How you sound": the tone words, and one example caption so the choice is concrete, not abstract. */
export function ManualVoiceCard({ form }: { form: UseFormReturn<ManualValues> }) {
  return (
    <Panel>
      <div className="mb-3.5">
        <h2 className="type-heading">How you sound</h2>
        <p className="type-label mt-1">Pick up to three. Every caption is written this way.</p>
      </div>
      <p className="type-label mb-3 flex items-center gap-1.5">
        <Sparkles aria-hidden className="size-3.5 shrink-0" />
        We started you on Friendly and Straightforward, which suit most small businesses. Change them if they don&apos;t sound like you.
      </p>
      <FormField
        control={form.control}
        name="voice"
        render={({ field }) => (
          <FormItem>
            <VoicePicker value={field.value} onChange={field.onChange} />
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="mt-4 rounded-xl bg-secondary/60 p-3.5">
        <p className="type-label">Example caption in this voice</p>
        <p className="mt-1.5">&ldquo;Fresh batch, same recipe. Here&apos;s what went into it and why.&rdquo;</p>
      </div>
    </Panel>
  );
}
