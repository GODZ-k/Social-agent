"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Hash, LoaderCircle, Shield } from "lucide-react";
import { connectSlack } from "@/lib/api/actions";
import { useServerAction } from "@/lib/api/use-server-action";
import { Lightbox } from "@repo/ui/components/lightbox";
import { Button } from "@repo/ui/components/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { connectSlackSchema, type ConnectSlackValues } from "./schema";

export function ConnectSlackDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const form = useForm<ConnectSlackValues>({ resolver: zodResolver(connectSlackSchema), defaultValues: { webhookUrl: "" } });
  const connect = useServerAction(connectSlack, { success: "Slack connected", onSuccess: close });

  function close() {
    onOpenChange(false);
    form.reset();
  }

  return (
    <Lightbox open={open} onOpenChange={(next) => (next ? onOpenChange(next) : close())} title="Connect Slack">
      <div className="grid w-[min(92vw,28rem)] gap-5 rounded-2xl bg-card p-6 text-foreground shadow-floating">
        <Form {...form}>
          <form onSubmit={form.handleSubmit((values) => connect.run(values.webhookUrl))} noValidate className="grid gap-4">
            <div className="flex items-start gap-3.5">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground">
                <Hash className="size-5" />
              </span>
              <div>
                <h2 className="type-heading">Connect Slack</h2>
                <p className="type-label mt-1">Create an incoming webhook in Slack, then paste its URL here.</p>
              </div>
            </div>
            <FormField
              control={form.control}
              name="webhookUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Webhook URL</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://…/webhooks/…" autoFocus />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-2 rounded-xl bg-secondary p-4 text-[0.8125rem] text-muted-foreground">
              <p className="flex gap-2">
                <Shield className="size-4 shrink-0" />
                The webhook only receives Cadence alerts; it can&rsquo;t read anything back from Slack.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={close}>
                Cancel
              </Button>
              <Button type="submit" disabled={connect.isPending}>
                {connect.isPending ? <LoaderCircle className="animate-spin" /> : <Hash />}
                Connect Slack
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Lightbox>
  );
}
