"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Archive as ArchiveIcon, Check, LoaderCircle } from "lucide-react";
import { deleteClient } from "@/lib/api/actions";
import { useServerAction } from "@/lib/api/use-server-action";
import type { Client } from "@/lib/types";
import { Button } from "@repo/ui/components/button";
import { Sheet } from "@repo/ui/components/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";

/** What deleting removes, itemised (owner decision, S16): specific enough that no one is surprised. */
function whatsGone(stats: Client["stats"]): string[] {
  const items = ["The brand kit and contact details", "The strategy and the research behind it"];
  const posts: string[] = [];
  if (stats.pendingApprovals > 0) posts.push(`${stats.pendingApprovals} approved`);
  if (stats.scheduled > 0) posts.push(`${stats.scheduled} scheduled that won't go out`);
  if (posts.length > 0) items.push(`Posts waiting, including ${posts.join(" and ")}`);
  items.push("Results and what the agent learned", "Every connected social account");
  return items;
}

export function DeleteConfirmSheet({
  client,
  noun,
  open,
  onOpenChange,
  onArchiveInstead,
}: {
  client: Pick<Client, "id" | "name" | "stats">;
  noun: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onArchiveInstead: () => void;
}) {
  const router = useRouter();
  const schema = z.object({ confirmName: z.string().refine((v) => v === client.name, "") });
  const form = useForm<{ confirmName: string }>({
    resolver: zodResolver(schema),
    defaultValues: { confirmName: "" },
    mode: "onChange",
  });
  const remove = useServerAction(deleteClient, { onSuccess: () => router.replace("/"), success: `${client.name} deleted` });

  useEffect(() => {
    if (!open) form.reset({ confirmName: "" });
  }, [open, form]);

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={`Delete ${client.name}?`}
      description="This can't be undone. It deletes:"
      footer={
        <>
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Keep the {noun}
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            disabled={!form.formState.isValid || remove.isPending}
            onClick={form.handleSubmit(() => remove.run(client.id))}
          >
            {remove.isPending && <LoaderCircle className="animate-spin" />}
            Delete for good
          </Button>
        </>
      }
    >
      <ul className="grid gap-2 text-[0.9375rem]">
        {whatsGone(client.stats).map((item) => (
          <li key={item} className="flex items-start gap-2.5">
            <span className="mt-2 size-1 shrink-0 rounded-full bg-destructive" />
            {item}
          </li>
        ))}
      </ul>
      <p className="type-label mt-3">Posts already published stay on the social networks. Delete them there if you want them gone.</p>

      <div className="mt-5 grid gap-1.5 rounded-xl bg-secondary p-4">
        <p className="flex items-center gap-2 font-medium">
          <ArchiveIcon className="size-4 shrink-0 text-muted-foreground" />
          Only want to stop for now?
        </p>
        <p className="type-label">Archive keeps everything and stops publishing. You can restore it any time.</p>
        <Button type="button" variant="outline" size="sm" className="mt-1.5 w-fit" onClick={onArchiveInstead}>
          Archive instead
        </Button>
      </div>

      <Form {...form}>
        <form className="mt-5" onSubmit={(e) => e.preventDefault()}>
          <FormField control={form.control} name="confirmName" render={({ field }) => (
            <FormItem>
              <FormLabel>
                Type <b className="text-foreground">{client.name}</b> to confirm
              </FormLabel>
              <FormControl>
                <Input {...field} autoComplete="off" spellCheck={false} />
              </FormControl>
              {field.value.length > 0 && field.value === client.name && (
                <p className="flex items-center gap-1.5 text-[0.8125rem] text-success">
                  <Check className="size-3.5" />Name matches
                </p>
              )}
            </FormItem>
          )} />
        </form>
      </Form>
    </Sheet>
  );
}
