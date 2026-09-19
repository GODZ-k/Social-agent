"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { useDeleteClient, useUpdateClient } from "@/lib/api/queries";
import type { Client } from "@/lib/types";
import { useViewer } from "@/hooks/use-viewer";
import { Panel } from "@repo/ui/components/states";
import { Button } from "@repo/ui/components/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/components/form";
import { Sheet } from "@repo/ui/components/sheet";
import { Switch } from "@repo/ui/components/switch";

const schema = z.object({
  timezone: z.string().min(1, "Choose a timezone."),
  approvalEmails: z.boolean(),
});
type Values = z.infer<typeof schema>;

export function Preferences({ client }: { client: Client }) {
  const router = useRouter();
  const { isAdmin } = useViewer();
  const noun = isAdmin ? "client" : "brand";
  const update = useUpdateClient(client.id);
  const remove = useDeleteClient(client.id);
  const [confirming, setConfirming] = useState(false);

  const timezones = useMemo(() => {
    const all = Intl.supportedValuesOf("timeZone");
    return all.includes(client.preferences.timezone) ? all : [client.preferences.timezone, ...all];
  }, [client.preferences.timezone]);

  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: client.preferences });

  return (
    <div className="grid gap-5">
      <Panel>
        <Form {...form}>
          <form
            className="grid gap-7"
            onSubmit={form.handleSubmit((values) =>
              update.mutate({ preferences: values }, { onSuccess: () => form.reset(values) }),
            )}
          >
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

            <Button type="submit" className="w-fit" disabled={!form.formState.isDirty || update.isPending}>
              {update.isPending && <LoaderCircle className="animate-spin" />}
              {update.isPending ? "Saving changes" : "Save changes"}
            </Button>
          </form>
        </Form>
      </Panel>

      <Panel className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
        <div className="max-w-[52ch]">
          <h2 className="type-heading">Delete this {noun}</h2>
          <p className="type-label mt-1">
            Removes the brand kit, strategy, every post and the analytics. Posts that are scheduled won&apos;t go out.
          </p>
        </div>
        <Button variant="outline" className="text-destructive" onClick={() => setConfirming(true)}>
          Delete {client.name}
        </Button>
      </Panel>

      {/* A confirmation only here: this is the one action in the product that can't be undone. */}
      <Sheet
        open={confirming}
        onOpenChange={setConfirming}
        title={`Delete ${client.name}?`}
        description="This can't be undone."
        footer={
          <>
            <Button variant="secondary" className="flex-1" onClick={() => setConfirming(false)}>
              Keep it
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              disabled={remove.isPending}
              onClick={() =>
                remove.mutate(undefined, {
                  onSuccess: () => {
                    toast(`${client.name} deleted`);
                    router.replace("/");
                  },
                })
              }
            >
              {remove.isPending && <LoaderCircle className="animate-spin" />}
              {remove.isPending ? "Deleting" : `Delete ${client.name}`}
            </Button>
          </>
        }
      >
        <ul className="grid gap-2.5 pt-2 text-[0.9375rem]">
          <li>The brand kit and strategy are removed.</li>
          <li>
            {client.stats.scheduled > 0
              ? `${client.stats.scheduled} scheduled ${client.stats.scheduled === 1 ? "post" : "posts"} will not be published.`
              : "There are no scheduled posts to cancel."}
          </li>
          <li>Posts already published stay on the social networks. Only the copies here are removed.</li>
          <li>Connected accounts are disconnected.</li>
        </ul>
      </Sheet>
    </div>
  );
}
