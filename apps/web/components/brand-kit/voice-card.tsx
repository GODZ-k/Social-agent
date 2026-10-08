"use client";

import { useWatch, type UseFormReturn } from "react-hook-form";
import type { Values } from "@/lib/forms/brand-kit";
import { EditableCard } from "./editable-card";
import { VoicePicker } from "./voice-picker";
import { FormField, FormItem, FormMessage } from "@repo/ui/components/form";
import type { CardControls } from "@/components/brand-kit/types";

/** "How you sound": up to a few words that set every caption's tone. */
export function VoiceCard({ form, ...card }: { form: UseFormReturn<Values> } & CardControls) {
  const voice = useWatch({ control: form.control, name: "voice" });

  return (
    <EditableCard title="How you sound" {...card}>
      {card.editing ? (
        <div className="grid gap-3">
          <p className="type-label">Pick up to three. Every caption is written this way.</p>
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
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {voice.map((word) => (
            <span key={word} className="rounded-full bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground">
              {word}
            </span>
          ))}
        </div>
      )}
    </EditableCard>
  );
}
