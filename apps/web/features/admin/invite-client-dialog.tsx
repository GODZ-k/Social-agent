"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { type InviteClientInput } from "@social-agent/shared";
import { LoaderCircle, Mail, Send, UserPlus } from "lucide-react";
import { inviteClient } from "@/lib/api/actions";
import type { AdminClientRow } from "@/lib/types";
import { Lightbox } from "@repo/ui/components/lightbox";
import { Button } from "@repo/ui/components/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { PersonAvatar } from "./person-avatar";

// Name and phone stay optional text on the form itself; the server schema (min length once
// present) applies after blank strings are turned into `undefined` in `submit`.
const formSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  name: z.string().optional(),
  phone: z.string().optional(),
});

/** ADM-3: invite a client by email. Handles the "already in use" answer inline, then a sent state. */
export function InviteClientDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [sentAs, setSentAs] = useState<AdminClientRow | null>(null);
  const [isPending, startTransition] = useTransition();
  const form = useForm<InviteClientInput>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", name: "", phone: "" },
  });

  function close(next: boolean) {
    onOpenChange(next);
    if (!next) {
      form.reset();
      setSentAs(null);
    }
  }

  function submit(values: InviteClientInput) {
    const input = { email: values.email, name: values.name?.trim() || undefined, phone: values.phone?.trim() || undefined };
    startTransition(async () => {
      const result = await inviteClient(input);
      if (!result.ok) {
        form.setError("email", { message: result.message });
        return;
      }
      setSentAs(result.data);
    });
  }

  return (
    <Lightbox open={open} onOpenChange={close} title={sentAs ? "Invite sent" : "Invite a client"}>
      <div className="grid w-[min(92vw,28rem)] gap-5 rounded-2xl bg-card p-6 text-foreground shadow-floating">
        {sentAs ? (
          <>
            <div className="grid size-11 place-items-center rounded-full bg-success/12 text-success">
              <Mail className="size-5" />
            </div>
            <div>
              <h2 className="type-heading">Invite sent to {sentAs.name ?? sentAs.email}</h2>
              <p className="type-label mt-1.5">The sign-in link stays valid for 30 days. You can resend or cancel it from their page.</p>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-secondary p-3">
              <PersonAvatar name={sentAs.name} email={sentAs.email} invited />
              <div className="min-w-0">
                <p className="truncate font-medium">{sentAs.email}</p>
                <p className="type-label">Invited just now</p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => close(false)}>
                Done
              </Button>
              <Button type="button" onClick={() => router.push(`/onboarding?for=${sentAs.id}`)}>
                <UserPlus /> Add a brand for {sentAs.name ?? "them"}
              </Button>
            </div>
          </>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(submit)} noValidate className="grid gap-4">
              <div>
                <h2 className="type-heading">Invite a client</h2>
                <p className="type-label mt-1">A business owner whose social media you&rsquo;ll run.</p>
              </div>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} autoComplete="name" />
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
                      <Input {...field} type="email" autoComplete="email" autoFocus />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Phone <span className="text-muted-foreground">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} type="tel" autoComplete="tel" placeholder="+1 718 555 0142" />
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
                <Button type="button" variant="outline" onClick={() => close(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? <LoaderCircle className="animate-spin" /> : <Send />}
                  Send invite
                </Button>
              </div>
            </form>
          </Form>
        )}
      </div>
    </Lightbox>
  );
}
