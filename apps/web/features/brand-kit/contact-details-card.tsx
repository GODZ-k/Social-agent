"use client";

import { useWatch, type UseFormReturn } from "react-hook-form";
import type { Values } from "@/features/brand-kit/schema";
import type { ScanSources } from "@/lib/types";
import { EditableCard, type CardControls } from "@/features/brand-kit/editable-card";
import { KvRow } from "@/features/brand-kit/kv-row";
import { Input } from "@repo/ui/components/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/components/form";

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
          <FormField
            control={form.control}
            name="contactEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contactPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contactAddress"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contactHours"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Opening hours</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Mon–Fri 9am–5pm" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ) : (
        <div>
          <KvRow label="Email" source={email ? sources?.email : undefined}>
            {email || <span className="text-muted-foreground">Not on your site</span>}
          </KvRow>
          <KvRow label="Address" source={address ? sources?.address : undefined}>
            {address || <span className="text-muted-foreground">Not on your site</span>}
          </KvRow>
          <KvRow label="Phone">{phone || <span className="text-muted-foreground">Not on your site</span>}</KvRow>
          <KvRow label="Opening hours">
            {hours || <span className="text-muted-foreground">Not on your site. Add them if customers can visit you.</span>}
          </KvRow>
          <p className="type-label mt-2.5">Posts use these exactly as written here. The agent never makes them up.</p>
        </div>
      )}
    </EditableCard>
  );
}
