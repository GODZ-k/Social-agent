"use client";

import { useWatch, type UseFormReturn } from "react-hook-form";
import type { Values } from "@/lib/forms/brand-kit";
import type { ScanSources } from "@/lib/types";
import { EditableCard } from "./editable-card";
import { KitField } from "./kit-field";
import { KvRow } from "./kv-row";
import type { CardControls } from "@/components/brand-kit/types";

/** A contact fact the scan did not find. */
function NotFound({ children = "Not on your site" }: { children?: React.ReactNode }) {
  return <span className="text-muted-foreground">{children}</span>;
}

/** "Contact details": the facts posts quote exactly. Missing ones read "Not on your site". */
export function ContactDetailsCard({
  form,
  sources,
  ...card
}: { form: UseFormReturn<Values>; sources?: ScanSources } & CardControls) {
  const [email, phone, address, hours] = useWatch({
    control: form.control,
    name: ["contactEmail", "contactPhone", "contactAddress", "contactHours"],
  });

  return (
    <EditableCard title="Contact details" {...card}>
      {card.editing ? (
        <div className="grid gap-5 sm:grid-cols-2">
          <KitField control={form.control} name="contactEmail" label="Email" />
          <KitField control={form.control} name="contactPhone" label="Phone" />
          <KitField control={form.control} name="contactAddress" label="Address" className="sm:col-span-2" />
          <KitField
            control={form.control}
            name="contactHours"
            label="Opening hours"
            placeholder="e.g. Mon–Fri 9am–5pm"
            className="sm:col-span-2"
          />
        </div>
      ) : (
        <div>
          <KvRow label="Email" source={email ? sources?.email : undefined}>
            {email || <NotFound />}
          </KvRow>
          <KvRow label="Address" source={address ? sources?.address : undefined}>
            {address || <NotFound />}
          </KvRow>
          <KvRow label="Phone">{phone || <NotFound />}</KvRow>
          <KvRow label="Opening hours">{hours || <NotFound>Not on your site. Add them if customers can visit you.</NotFound>}</KvRow>
          <p className="type-label mt-2.5">Posts use these exactly as written here. The agent never makes them up.</p>
        </div>
      )}
    </EditableCard>
  );
}
