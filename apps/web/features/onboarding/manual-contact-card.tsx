"use client";

import type { UseFormReturn } from "react-hook-form";
import type { ManualValues } from "@/features/onboarding/manual-kit-schema";
import { Panel } from "@repo/ui/components/states";
import { Badge } from "@repo/ui/components/badge";
import { Input } from "@repo/ui/components/input";
import { Switch } from "@repo/ui/components/switch";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/components/form";

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
          <FormField
            control={form.control}
            name="contactPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="+1 555 010 2030" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contactEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="hello@yourbusiness.com" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="contactAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Street, city, region and country" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
        {hoursEnabled && (
          <FormField
            control={form.control}
            name="contactHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Opening hours</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Mon–Fri 9am–5pm" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
    </Panel>
  );
}
