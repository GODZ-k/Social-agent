"use client";

import { useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LoaderCircle, Lock, Clock, Mail } from "lucide-react";
import { updatePreferences } from "@/lib/api/actions";
import { useServerAction } from "@/lib/api/use-server-action";
import type { Preferences } from "@/lib/types";
import { Panel } from "@repo/ui/components/states";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";
import { Segmented } from "@repo/ui/components/segmented";
import { Switch } from "@repo/ui/components/switch";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/components/form";

const LANGUAGE_OPTIONS = [
  { value: "en" as const, label: "English" },
  { value: "hi" as const, label: "हिन्दी" },
  { value: "hinglish" as const, label: "Hinglish" },
];

const language = z.enum(["en", "hi", "hinglish"]);

const schema = z.object({
  timezone: z.string().min(1, "Choose a timezone."),
  postLanguage: language,
  chatLanguage: language,
  approvalEmails: z.boolean(),
});
type Values = z.infer<typeof schema>;

export function PreferencesForm({ brandId, preferences }: { brandId: string; preferences: Preferences }) {
  const timezones = useMemo(() => {
    const all = Intl.supportedValuesOf("timeZone");
    return all.includes(preferences.timezone) ? all : [preferences.timezone, ...all];
  }, [preferences.timezone]);

  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: preferences });
  const save = useServerAction(updatePreferences, {
    success: "Changes saved",
    failure: "Couldn't save those changes.",
    onSuccess: (saved) => form.reset(saved),
  });

  return (
    <Form {...form}>
      <form className="grid gap-5" onSubmit={form.handleSubmit((values) => save.run(brandId, values))}>
        <Panel>
          <h2 className="type-heading">Publishing</h2>
          <p className="type-label mt-1">When posts go out.</p>
          <FormField control={form.control} name="timezone" render={({ field }) => (
            <FormItem className="mt-5 max-w-sm">
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
              <FormDescription>Best times, the calendar and every publish time use this.</FormDescription>
              <FormMessage />
            </FormItem>
          )} />
        </Panel>

        <Panel>
          <h2 className="type-heading">Language</h2>
          <p className="type-label mt-1">Set during the questionnaire. Change it any time.</p>
          <div className="mt-5 grid gap-5">
            <Controller control={form.control} name="postLanguage" render={({ field }) => (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium">Posts are written in</p>
                  <p className="type-label mt-0.5">Applies to posts written from now on.</p>
                </div>
                <Segmented label="Post language" value={field.value} onValueChange={field.onChange} options={LANGUAGE_OPTIONS} />
              </div>
            )} />
            <Controller control={form.control} name="chatLanguage" render={({ field }) => (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-5">
                <div>
                  <p className="font-medium">Your account manager chats in</p>
                  <p className="type-label mt-0.5">The language of questions and messages from the agent.</p>
                </div>
                <Segmented label="Account manager language" value={field.value} onValueChange={field.onChange} options={LANGUAGE_OPTIONS} />
              </div>
            )} />
          </div>
        </Panel>

        <Panel>
          <h2 className="type-heading">Approvals and emails</h2>
          <p className="type-label mt-1">How the agent checks with you.</p>
          <div className="mt-5 grid gap-4">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="flex items-center gap-2 font-medium"><Lock className="size-4 text-muted-foreground" />A person approves every post</p>
                <p className="type-label mt-0.5">Nothing is published without your yes. This can&apos;t be turned off.</p>
              </div>
              <Badge variant="neutral" className="shrink-0"><Lock className="size-3" />Always on</Badge>
            </div>
            <div className="flex items-start justify-between gap-6 border-t pt-4">
              <div>
                <p className="flex items-center gap-2 font-medium"><Clock className="size-4 text-muted-foreground" />New strategies start after 30 minutes</p>
                <p className="type-label mt-0.5">
                  You get 30 minutes to read a new strategy or ask for changes. After that it starts on its own, and its posts still wait
                  for your approval.
                </p>
              </div>
              <Badge variant="neutral" className="shrink-0"><Lock className="size-3" />Always on</Badge>
            </div>
            <FormField control={form.control} name="approvalEmails" render={({ field }) => (
              <FormItem className="flex flex-row items-start justify-between gap-6 border-t pt-4">
                <div className="grid gap-0.5">
                  <FormLabel className="flex items-center gap-2 text-[0.9375rem]">
                    <Mail className="size-4 text-muted-foreground" />Email me when posts need approval
                  </FormLabel>
                  <FormDescription>One email per batch, not one per post.</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )} />
          </div>
        </Panel>

        <Button type="submit" className="w-fit" disabled={!form.formState.isDirty || save.isPending}>
          {save.isPending && <LoaderCircle className="animate-spin" />}
          {save.isPending ? "Saving changes" : "Save changes"}
        </Button>
      </form>
    </Form>
  );
}
