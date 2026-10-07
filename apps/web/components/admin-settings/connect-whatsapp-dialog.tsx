"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Phone, Shield } from "lucide-react";
import { connectWhatsApp } from "@/lib/api/actions";
import { useServerAction } from "@/lib/api/use-server-action";
import { KitField } from "@/components/brand-kit/kit-field";
import { SettingsFormDialog } from "./settings-form-dialog";
import { connectWhatsAppSchema, type ConnectWhatsAppValues } from "@/lib/forms/admin-settings";

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
    <SettingsFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Connect WhatsApp"
      icon={<Phone className="size-5" />}
      description="Needs a WhatsApp Business API number, not a personal WhatsApp account."
      note={
        <>
          <Shield className="size-4 shrink-0" />
          The token only sends Cadence alerts to this number; it can&rsquo;t read your WhatsApp messages.
        </>
      }
      form={form}
      onSubmit={(values) => connect.run(values.phoneNumber, values.apiToken)}
      isPending={connect.isPending}
      submitIcon={<Phone />}
      submitLabel="Connect WhatsApp"
    >
      <KitField
        control={form.control}
        name="phoneNumber"
        label="WhatsApp Business number"
        type="tel"
        placeholder="+1 415 555 0132"
        autoFocus
      />
      <KitField
        control={form.control}
        name="apiToken"
        label="API token"
        type="password"
        placeholder="From your WhatsApp Business API provider"
      />
    </SettingsFormDialog>
  );
}
