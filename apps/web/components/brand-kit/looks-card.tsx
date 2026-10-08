"use client";

import { useWatch, type UseFormReturn } from "react-hook-form";
import type { Values } from "@/lib/forms/brand-kit";
import type { ScanSources } from "@/lib/types";
import { EditableCard } from "./editable-card";
import { ColorList } from "./color-list";
import { KitField } from "./kit-field";
import { KvRow } from "./kv-row";
import type { CardControls } from "@/components/brand-kit/types";

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
            <KitField control={form.control} name="headingFont" label="Heading typeface" />
            <KitField control={form.control} name="bodyFont" label="Body typeface" />
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
