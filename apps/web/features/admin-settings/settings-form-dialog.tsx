"use client";

import { LoaderCircle } from "lucide-react";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { Lightbox } from "@repo/ui/components/lightbox";
import { Button } from "@repo/ui/components/button";
import { Form } from "@repo/ui/components/form";

/**
 * The frame shared by every "connect a channel" / "invite someone" dialog: title (with an
 * optional icon), a reassurance note, the form fields the caller supplies, then Cancel/Submit.
 * Closing always resets the form, whether from Cancel, the backdrop, or a successful submit.
 */
export function SettingsFormDialog<TValues extends FieldValues>({
  open,
  onOpenChange,
  title,
  icon,
  description,
  note,
  form,
  onSubmit,
  isPending,
  submitIcon,
  submitLabel,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** Shown in a circle beside the title; omit for a plain title (e.g. inviting a teammate). */
  icon?: React.ReactNode;
  description: string;
  /** The reassurance note box's content, icon included (e.g. a Shield plus its line of text). */
  note: React.ReactNode;
  form: UseFormReturn<TValues>;
  onSubmit: (values: TValues) => void;
  isPending: boolean;
  submitIcon: React.ReactNode;
  submitLabel: string;
  children: React.ReactNode;
}) {
  function close() {
    onOpenChange(false);
    form.reset();
  }

  return (
    <Lightbox open={open} onOpenChange={(next) => (next ? onOpenChange(next) : close())} title={title}>
      <div className="grid w-[min(92vw,28rem)] gap-5 rounded-2xl bg-card p-6 text-foreground shadow-floating">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="grid gap-4">
            <div className="flex items-start gap-3.5">
              {icon && (
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground">{icon}</span>
              )}
              <div>
                <h2 className="type-heading">{title}</h2>
                <p className="type-label mt-1">{description}</p>
              </div>
            </div>
            {children}
            <div className="grid gap-2 rounded-xl bg-secondary p-4 text-[0.8125rem] text-muted-foreground">
              <p className="flex gap-2">{note}</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={close}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <LoaderCircle className="animate-spin" /> : submitIcon}
                {submitLabel}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Lightbox>
  );
}
