"use client";

import { CircleAlert } from "lucide-react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import type { Values } from "@/features/brand-kit/schema";
import type { ScanSources } from "@/lib/types";
import { EditableCard, type CardControls } from "@/features/brand-kit/editable-card";
import { KvRow } from "@/features/brand-kit/kv-row";
import { Input, Textarea } from "@repo/ui/components/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/components/form";

/** "The business": name, type, what they do, and the tagline (flagged when the site had none). */
export function BusinessCard({
  form,
  sources,
  ...card
}: { form: UseFormReturn<Values>; sources?: ScanSources } & CardControls) {
  const [name, industry, summary, tagline] = useWatch({ control: form.control, name: ["name", "industry", "summary", "tagline"] });

  return (
    <EditableCard title="The business" {...card}>
      {card.editing ? (
        <div className="grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business name</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel>Type of business</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="summary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>What you do</FormLabel>
                <FormControl>
                  <Textarea rows={3} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tagline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tagline</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ) : (
        <div>
          <KvRow label="Name">
            <span className="font-medium">{name}</span>
          </KvRow>
          <KvRow label="Type of business">{industry}</KvRow>
          <KvRow label="What you do" source={sources?.summary}>
            {summary}
          </KvRow>
          <KvRow label="Tagline">{tagline ? tagline : <span className="text-muted-foreground">Not found</span>}</KvRow>
          {!tagline && (
            <div className="mt-1 flex gap-2.5 rounded-xl bg-warning/10 p-3.5 text-sm">
              <CircleAlert className="mt-0.5 size-4 shrink-0 text-warning" />
              <p>
                <span className="font-semibold">Please check:</span> your site has no tagline. Add one line about what you&apos;re known for,
                or leave it empty.
              </p>
            </div>
          )}
        </div>
      )}
    </EditableCard>
  );
}
