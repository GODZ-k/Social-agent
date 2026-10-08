"use client";

import { CircleAlert } from "lucide-react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import type { Values } from "@/lib/forms/brand-kit";
import type { ScanSources } from "@/lib/types";
import { EditableCard } from "./editable-card";
import { KitField } from "./kit-field";
import { KvRow } from "./kv-row";
import type { CardControls } from "@/components/brand-kit/types";

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
            <KitField control={form.control} name="name" label="Business name" />
            <KitField control={form.control} name="industry" label="Type of business" />
          </div>
          <KitField control={form.control} name="summary" label="What you do" rows={3} />
          <KitField control={form.control} name="tagline" label="Tagline" />
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
