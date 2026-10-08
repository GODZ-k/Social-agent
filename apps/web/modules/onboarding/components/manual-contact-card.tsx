"use client";

import type { UseFormReturn } from "react-hook-form";
import type { ManualValues } from "@/modules/onboarding/schemas/manual-kit";
import { KitField } from "@/components/brand-kit/kit-field";
import { Panel } from "@repo/ui/components/states";
import { Badge } from "@repo/ui/components/badge";
import { Switch } from "@repo/ui/components/switch";
import { FormControl, FormField, FormItem, FormLabel } from "@repo/ui/components/form";

/** "Contact details": used only when a post needs them, like opening hours on a holiday post. All optional. */
export function ManualContactCard({ form }: { form: UseFormReturn<ManualValues> }) {
  const hoursEnabled = form.watch("hoursEnabled");

  return (
    <Panel>
      <div className="mb-3.5 flex items-center justify-between gap-4">
        <div>
          <h2 className="type-heading">Contact details</h2>
          <p className="type-label mt-1">Used only when a post needs them, like opening hours on a holiday post.</p>
        </div>
        <Badge variant="neutral">All optional</Badge>
      </div>
      <div className="grid gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <KitField control={form.control} name="contactPhone" label="Phone" placeholder="+1 555 010 2030" />
          <KitField control={form.control} name="contactEmail" label="Email" placeholder="hello@yourbusiness.com" />
        </div>
        <KitField control={form.control} name="contactAddress" label="Address" placeholder="Street, city, region and country" />
        <FormField
          control={form.control}
          name="hoursEnabled"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between gap-4">
                <FormLabel className="mb-0">Customers can visit us in person</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </div>
              <p className="type-label">Off: posts never mention hours or a place to visit. Turn it on to add your hours.</p>
            </FormItem>
          )}
        />
        {hoursEnabled && <KitField control={form.control} name="contactHours" label="Opening hours" placeholder="e.g. Mon–Fri 9am–5pm" />}
      </div>
    </Panel>
  );
}
