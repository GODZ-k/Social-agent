"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Phone, Shield } from "lucide-react";
import { connectWhatsApp } from "@/lib/api/actions";
import { useServerAction } from "@/lib/api/use-server-action";
import { Lightbox } from "@repo/ui/components/lightbox";
import { Button } from "@repo/ui/components/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { connectWhatsAppSchema, type ConnectWhatsAppValues } from "./schema";

export function ConnectWhatsAppDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const form = useForm<ConnectWhatsAppValues>({
    resolver: zodResolver(connectWhatsAppSchema),
    defaultValues: { phoneNumber: "", apiToken: "" },
  });
  const connect = useServerAction(connectWhatsApp, { success: "WhatsApp connected", onSuccess: close });

  function close() {
    onOpenChange(false);
    form.reset();
  }

  return (
    <Lightbox open={open} onOpenChange={(next) => (next ? onOpenChange(next) : close())} title="Connect WhatsApp">
      <div className="grid w-[min(92vw,28rem)] gap-5 rounded-2xl bg-card p-6 text-foreground shadow-floating">
        <Form {...form}>
          <form onSubmit={form.handleSubmit((values) => connect.run(values.phoneNumber, values.apiToken))} noValidate className="grid gap-4">
            <div className="flex items-start gap-3.5">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground">
                <Phone className="size-5" />
              </span>
              <div>
                <h2 className="type-heading">Connect WhatsApp</h2>
                <p className="type-label mt-1">Needs a WhatsApp Business API number, not a personal WhatsApp account.</p>
              </div>
            </div>
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp Business number</FormLabel>
                  <FormControl>
                    <Input {...field} type="tel" placeholder="+1 415 555 0132" autoFocus />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="apiToken"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API token</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" placeholder="From your WhatsApp Business API provider" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-2 rounded-xl bg-secondary p-4 text-[0.8125rem] text-muted-foreground">
              <p className="flex gap-2">
                <Shield className="size-4 shrink-0" />
                The token only sends Cadence alerts to this number; it can&rsquo;t read your WhatsApp messages.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={close}>
                Cancel
              </Button>
              <Button type="submit" disabled={connect.isPending}>
                {connect.isPending ? <LoaderCircle className="animate-spin" /> : <Phone />}
                Connect WhatsApp
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Lightbox>
  );
}
