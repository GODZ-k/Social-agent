"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Send } from "lucide-react";
import { inviteTeammate } from "@/lib/api/actions";
import { useServerAction } from "@/lib/api/use-server-action";
import { KitField } from "@/components/brand-kit/kit-field";
import { SettingsFormDialog } from "./settings-form-dialog";
import { inviteTeammateSchema, type InviteTeammateValues } from "@/modules/admin-settings/schemas/admin-settings";

/** They sign in as an admin and see every client, same as everyone else on the team. */
export function InviteTeammateDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const form = useForm<InviteTeammateValues>({ resolver: zodResolver(inviteTeammateSchema), defaultValues: { name: "", email: "" } });
  const invite = useServerAction(inviteTeammate, {
    success: (member) => `Invited ${member.name}`,
    onSuccess: close,
  });

  function close() {
    onOpenChange(false);
    form.reset();
  }

  return (
    <SettingsFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Invite a teammate"
      description="They sign in as an admin and see every client, same as you."
      note={
        <>
          <Mail className="size-4 shrink-0" />
          They get an email with a link to sign in. They show up here as Invited until they do.
        </>
      }
      form={form}
      onSubmit={(values) => invite.run(values)}
      isPending={invite.isPending}
      submitIcon={<Send />}
      submitLabel="Send invite"
    >
      <KitField control={form.control} name="name" label="Name" autoComplete="name" autoFocus />
      <KitField control={form.control} name="email" label="Email" type="email" autoComplete="email" />
    </SettingsFormDialog>
  );
}
