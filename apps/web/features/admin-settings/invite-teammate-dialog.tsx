"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Send } from "lucide-react";
import { inviteTeammate } from "@/lib/api/actions";
import { useServerAction } from "@/lib/api/use-server-action";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { SettingsFormDialog } from "./settings-form-dialog";
import { inviteTeammateSchema, type InviteTeammateValues } from "./schema";

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
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input {...field} autoComplete="name" autoFocus />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input {...field} type="email" autoComplete="email" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </SettingsFormDialog>
  );
}
