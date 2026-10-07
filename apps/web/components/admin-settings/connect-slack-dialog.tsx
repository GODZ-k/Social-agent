"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Hash, Shield } from "lucide-react";
import { connectSlack } from "@/lib/api/actions";
import { useServerAction } from "@/lib/api/use-server-action";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { SettingsFormDialog } from "./settings-form-dialog";
import { connectSlackSchema, type ConnectSlackValues } from "@/lib/forms/admin-settings";

export function ConnectSlackDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const form = useForm<ConnectSlackValues>({ resolver: zodResolver(connectSlackSchema), defaultValues: { webhookUrl: "" } });
  const connect = useServerAction(connectSlack, { success: "Slack connected", onSuccess: close });

  function close() {
    onOpenChange(false);
    form.reset();
  }

  return (
    <SettingsFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Connect Slack"
      icon={<Hash className="size-5" />}
      description="Create an incoming webhook in Slack, then paste its URL here."
      note={
        <>
          <Shield className="size-4 shrink-0" />
          The webhook only receives Cadence alerts; it can&rsquo;t read anything back from Slack.
        </>
      }
      form={form}
      onSubmit={(values) => connect.run(values.webhookUrl)}
      isPending={connect.isPending}
      submitIcon={<Hash />}
      submitLabel="Connect Slack"
    >
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
    </SettingsFormDialog>
  );
}
