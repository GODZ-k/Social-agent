"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/button";

const REASONS = ["Off brand", "Wrong picture", "Wrong time"];

/** The toast after a reject: optional reasons that feed the agent's learnings. */
export function RejectToast({ onUndo, onReason }: { onUndo: () => void; onReason: (reason: string) => void }) {
  const [otherOpen, setOtherOpen] = useState(false);
  const [other, setOther] = useState("");

  return (
    <div className="w-[min(24rem,calc(100vw-1.5rem))] rounded-2xl border bg-card p-3.5 shadow-floating">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[0.9375rem]">
          <b className="font-semibold">Rejected.</b> <span className="text-muted-foreground">Tell the agent why?</span>
        </p>
        <Button size="sm" variant="outline" onClick={onUndo}>
          Undo
        </Button>
      </div>
      {otherOpen ? (
        <form
          className="mt-2.5 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (other.trim()) onReason(other.trim());
          }}
        >
          <input
            autoFocus
            value={other}
            onChange={(e) => setOther(e.target.value)}
            placeholder="What was wrong?"
            className="h-8.5 flex-1 rounded-full border px-3.5 text-[0.8125rem] outline-none focus-visible:border-primary"
          />
          <Button type="submit" size="sm" disabled={!other.trim()}>
            Send
          </Button>
        </form>
      ) : (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {REASONS.map((reason) => (
            <button
              key={reason}
              type="button"
              onClick={() => onReason(reason)}
              className="pressable rounded-full bg-secondary px-3 py-1 text-[0.8125rem] font-medium hover:bg-accent"
            >
              {reason}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setOtherOpen(true)}
            className="pressable rounded-full bg-secondary px-3 py-1 text-[0.8125rem] font-medium hover:bg-accent"
          >
            Something else
          </button>
        </div>
      )}
    </div>
  );
}
