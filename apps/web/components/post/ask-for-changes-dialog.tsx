"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send } from "lucide-react";
import { Lightbox } from "@repo/ui/components/lightbox";
import { Button } from "@repo/ui/components/button";

const schema = z.object({ note: z.string().trim().min(1, "Say what you would like changed.") });
type Values = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (note: string) => void;
  pending?: boolean;
  initialText?: string;
}

/** The one place a post's content changes: a note to the agent, not a text editor. */
export function AskForChangesDialog({ open, onOpenChange, onSend, pending, initialText = "" }: Props) {
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { note: initialText } });
  const note = useWatch({ control: form.control, name: "note" });
  // Re-arm the draft each time the dialog opens, without an effect.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) form.reset({ note: initialText });
  }

  function submit(values: Values) {
    onSend(values.note);
  }

  return (
    <Lightbox open={open} onOpenChange={onOpenChange} title="Ask for changes">
      <form
        className="grid w-[min(92vw,28rem)] gap-3 rounded-2xl bg-card p-6 text-foreground shadow-floating"
        onSubmit={form.handleSubmit(submit)}
      >
        <div>
          <h2 className="type-heading">What should change?</h2>
          <p className="type-label mt-1">Say it in your own words; the agent redrafts it.</p>
        </div>
        <textarea
          autoFocus
          rows={4}
          placeholder="e.g. Fewer hashtags, and mention weekend hours."
          className="w-full resize-none rounded-xl border px-3.5 py-2.5 text-[0.9375rem] outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-ring/30"
          {...form.register("note")}
        />
        {form.formState.errors.note ? <p className="type-label text-destructive">{form.formState.errors.note.message}</p> : null}
        <p className="type-label">The agent redrafts it and it comes back for another look.</p>
        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={!note.trim() || pending}>
            <Send /> Send to the agent
          </Button>
        </div>
      </form>
    </Lightbox>
  );
}
