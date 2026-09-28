"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Mail, Send } from "lucide-react";
import { inviteTeammate } from "@/lib/api/actions";
import { useServerAction } from "@/lib/api/use-server-action";
import { Lightbox } from "@repo/ui/components/lightbox";
import { Button } from "@repo/ui/components/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
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
    <Lightbox open={open} onOpenChange={(next) => (next ? onOpenChange(next) : close())} title="Invite a teammate">
      <div className="grid w-[min(92vw,28rem)] gap-5 rounded-2xl bg-card p-6 text-foreground shadow-floating">
        <Form {...form}>
          <form onSubmit={form.handleSubmit((values) => invite.run(values))} noValidate className="grid gap-4">
            <div>
              <h2 className="type-heading">Invite a teammate</h2>
              <p className="type-label mt-1">They sign in as an admin and see every client, same as you.</p>
            </div>
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
            <div className="grid gap-2 rounded-xl bg-secondary p-4 text-[0.8125rem] text-muted-foreground">
              <p className="flex gap-2">
                <Mail className="size-4 shrink-0" />
                They get an email with a link to sign in. They show up here as Invited until they do.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={close}>
                Cancel
              </Button>
              <Button type="submit" disabled={invite.isPending}>
                {invite.isPending ? <LoaderCircle className="animate-spin" /> : <Send />}
                Send invite
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Lightbox>
  );
}
