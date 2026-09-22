"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LoaderCircle } from "lucide-react";
import { updateClient } from "@/lib/api/actions";
import { useServerAction } from "@/lib/api/use-server-action";
import type { ClientPreferences } from "@/lib/types";
import { Panel } from "@repo/ui/components/states";
import { Button } from "@repo/ui/components/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/components/form";
import { Switch } from "@repo/ui/components/switch";

const schema = z.object({
  timezone: z.string().min(1, "Choose a timezone."),
  approvalEmails: z.boolean(),
});
type Values = z.infer<typeof schema>;

export function PreferencesForm({ clientId, preferences }: { clientId: string; preferences: ClientPreferences }) {
  const timezones = useMemo(() => {
    const all = Intl.supportedValuesOf("timeZone");
    return all.includes(preferences.timezone) ? all : [preferences.timezone, ...all];
  }, [preferences.timezone]);

  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: preferences });
  const save = useServerAction(updateClient, {
    success: "Changes saved",
    failure: "Couldn't save those changes.",
    onSuccess: (saved) => form.reset(saved.preferences),
  });

  return (
    <Panel>
      <Form {...form}>
        <form className="grid gap-7" onSubmit={form.handleSubmit((values) => save.run(clientId, { preferences: values }))}>
          <FormField control={form.control} name="timezone" render={({ field }) => (
            <FormItem className="max-w-sm">
              <FormLabel>Timezone</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="h-11 w-full rounded-md border border-input bg-card px-3 text-[0.9375rem] focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-ring/30 focus-visible:outline-none"
                >
                  {timezones.map((tz) => (
                    <option key={tz} value={tz}>{tz.replaceAll("_", " ")}</option>
                  ))}
                </select>
              </FormControl>
              <FormDescription>Publish times on the calendar are shown and scheduled in this timezone.</FormDescription>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="approvalEmails" render={({ field }) => (
            <FormItem className="flex items-center justify-between gap-6">
              <div className="grid gap-1">
                <FormLabel className="text-[0.9375rem]">Email me when posts need approval</FormLabel>
                <FormDescription>One email per batch, not one per post.</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )} />

          <Button type="submit" className="w-fit" disabled={!form.formState.isDirty || save.isPending}>
            {save.isPending && <LoaderCircle className="animate-spin" />}
            {save.isPending ? "Saving changes" : "Save changes"}
          </Button>
        </form>
      </Form>
    </Panel>
  );
}
