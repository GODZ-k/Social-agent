"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, UserRound } from "lucide-react";
import { updateAccountDetails } from "@/lib/api/actions";
import { useServerAction } from "@/lib/api/use-server-action";
import type { AccountDetails } from "@/lib/types";
import { Panel } from "@repo/ui/components/states";
import { Button } from "@repo/ui/components/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { accountDetailsSchema, type AccountDetailsValues } from "./schema";

/** BA-2: name and email, shown as a row until "Edit" turns it into a two-field form in place. */
export function DetailsPanel({ details }: { details: AccountDetails }) {
  const [editing, setEditing] = useState(false);
  const form = useForm<AccountDetailsValues>({ resolver: zodResolver(accountDetailsSchema), defaultValues: details });
  const save = useServerAction(updateAccountDetails, {
    success: "Details saved",
    failure: "Couldn't save those details.",
    onSuccess: (saved) => {
      form.reset(saved);
      setEditing(false);
    },
  });

  return (
    <Panel>
      <div className="mb-4">
        <h2 className="type-heading">Details</h2>
        <p className="type-label mt-1 text-muted-foreground">Only you and support see these.</p>
      </div>
      {editing ? (
        <Form {...form}>
          <form className="grid gap-4 border-t border-border pt-4" onSubmit={form.handleSubmit((values) => save.run(values))}>
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
              <Button type="button" variant="outline" onClick={() => { form.reset(details); setEditing(false); }}>
                Cancel
              </Button>
              <Button type="submit" disabled={save.isPending}>
                {save.isPending && <LoaderCircle className="animate-spin" />}
                {save.isPending ? "Saving changes" : "Save changes"}
              </Button>
            </div>
          </form>
        </Form>
      ) : (
        <div className="flex items-center gap-3.5">
          <span className="grid size-10 shrink-0 place-items-center rounded-[0.875rem] bg-secondary text-muted-foreground">
            <UserRound className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-medium">{details.name}</p>
            <p className="type-label truncate text-muted-foreground">{details.email}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            Edit
          </Button>
        </div>
      )}
    </Panel>
  );
}
