"use client";

import { useState } from "react";
import { Dialog } from "radix-ui";
import { Clock, Send } from "lucide-react";
import { askForStrategyChanges } from "@/lib/api/actions";
import { useServerAction } from "@/lib/api/use-server-action";
import { cn } from "@/lib/utils";
import { Button } from "@repo/ui/components/button";

const SUGGESTIONS = ["Fewer posts a week", "More behind the scenes", "No Facebook", "Different days"];

/** S20b: what to change, as a chip or in the owner's own words. A redraft gets a fresh 30 minutes. */
export function AskForChangesDialog({
  clientId,
  open,
  onOpenChange,
}: {
  clientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [request, setRequest] = useState("");
  const ask = useServerAction(askForStrategyChanges, {
    success: (strategy) => `Redrafting your strategy to version ${strategy.version}`,
    onSuccess: () => {
      setRequest("");
      onOpenChange(false);
    },
  });

  function toggleSuggestion(suggestion: string) {
    setRequest((current) =>
      current.includes(suggestion)
        ? current.replace(`${suggestion}.`, "").trim()
        : current
          ? `${current} ${suggestion}.`
          : `${suggestion}.`,
    );
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-scrim" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 grid gap-4 rounded-t-2xl bg-card p-5 shadow-floating sm:inset-auto sm:top-1/2 sm:left-1/2 sm:w-[34rem] sm:max-w-[92vw] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:p-6">
          <div>
            <Dialog.Title className="type-heading">What should change?</Dialog.Title>
            <Dialog.Description className="type-label mt-1">Tap one or say it in your own words.</Dialog.Description>
          </div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => toggleSuggestion(suggestion)}
                className={cn(
                  "rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                  request.includes(suggestion) ? "bg-primary text-primary-foreground" : "bg-tint text-tint-foreground ring-1 ring-tint-strong",
                )}
              >
                {suggestion}
              </button>
            ))}
          </div>
          <textarea
            aria-label="Your changes"
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            placeholder="What would you change about the plan?"
            className="min-h-24 resize-none rounded-xl px-3.5 py-3 text-[0.9375rem] text-foreground shadow-[inset_0_0_0_1px_var(--input)] outline-none"
          />
          <p className="type-label flex items-center gap-1.5">
            <Clock className="size-4 shrink-0" />
            The strategist redrafts it in about a minute. Then you get a fresh 30 minutes.
          </p>
          <div className="flex gap-2 sm:justify-end">
            <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button className="flex-1 sm:flex-none" disabled={!request.trim() || ask.isPending} onClick={() => ask.run(clientId, request)}>
              <Send />
              {ask.isPending ? "Sending" : "Send to strategist"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
