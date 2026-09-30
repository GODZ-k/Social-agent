"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { updateAccountDetails } from "@/lib/api/actions";
import { useServerAction } from "@/lib/api/use-server-action";
import type { AccountDetails } from "@/lib/types";
import { Button } from "@repo/ui/components/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { AccountAvatar } from "@/components/shell/account-avatar";
import { AccountRow, AccountSection } from "./account-row";
import { accountDetailsSchema, type AccountDetailsValues } from "./schema";

/** BA-2's "Account" tab: who you are. Editing happens in the row, not on another screen. */
export function ProfileTab({ details, onSaved }: { details: AccountDetails; onSaved: (saved: AccountDetails) => void }) {
  const [editing, setEditing] = useState(false);
  const form = useForm<AccountDetailsValues>({ resolver: zodResolver(accountDetailsSchema), defaultValues: details });
  const save = useServerAction(updateAccountDetails, {
    success: "Details saved",
    failure: "Couldn't save those details.",
    onSuccess: (saved) => {
      form.reset(saved);
      onSaved(saved);
      setEditing(false);
    },
  });

  function cancel() {
    form.reset(details);
    setEditing(false);
  }

  if (editing) {
    return (
      <AccountSection title="Profile">
        <Form {...form}>
          <form className="grid gap-4 py-4" onSubmit={form.handleSubmit((values) => save.run(values))}>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input type="email" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={cancel}>Cancel</Button>
              <Button type="submit" size="sm" disabled={save.isPending}>
                {save.isPending && <LoaderCircle className="animate-spin" />}
                {save.isPending ? "Saving" : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      </AccountSection>
    );
  }

  return (
    <AccountSection title="Profile">
      <AccountRow
        label="Name"
        action={<Button variant="outline" size="sm" onClick={() => setEditing(true)}>Edit</Button>}
      >
        <div className="flex items-center gap-3">
          <AccountAvatar name={details.name} className="size-9 text-xs" />
          <p className="truncate font-medium">{details.name}</p>
        </div>
      </AccountRow>
      <AccountRow label="Email address">
        <p className="truncate">{details.email}</p>
        <p className="type-label mt-1 text-muted-foreground">Only you and support see this.</p>
      </AccountRow>
    </AccountSection>
  );
}
