"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Lightbox } from "@repo/ui/components/lightbox";
import { Button } from "@repo/ui/components/button";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (note: string) => void;
  pending?: boolean;
  initialText?: string;
}

/** The one place a post's content changes: a note to the agent, not a text editor. */
export function AskForChangesDialog({ open, onOpenChange, onSend, pending, initialText = "" }: Props) {
  const [note, setNote] = useState(initialText);
  // Re-arm the draft each time the dialog opens, without an effect.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setNote(initialText);
  }

  function send() {
    const trimmed = note.trim();
    if (trimmed) onSend(trimmed);
  }

  return (
    <Lightbox open={open} onOpenChange={onOpenChange} title="Ask for changes">
      <div className="grid w-[min(92vw,28rem)] gap-3 rounded-2xl bg-card p-6 text-foreground shadow-floating">
        <div>
          <h2 className="type-heading">What should change?</h2>
          <p className="type-label mt-1">Say it in your own words; the agent redrafts it.</p>
        </div>
        <textarea
          autoFocus
          rows={4}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Fewer hashtags, and mention weekend hours."
          className="w-full resize-none rounded-xl border px-3.5 py-2.5 text-[0.9375rem] outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-ring/30"
        />
        <p className="type-label">The agent redrafts it and it comes back for another look.</p>
        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" disabled={!note.trim() || pending} onClick={send}>
            <Send /> Send to the agent
          </Button>
        </div>
      </div>
    </Lightbox>
  );
}
