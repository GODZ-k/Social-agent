"use client";

import { Check, Pencil, X } from "lucide-react";
import { Button } from "@repo/ui/components/button";

interface Props {
  onReject: () => void;
  onAsk: () => void;
  onApprove: () => void;
}

const kbd = "inline-grid size-6 min-w-6 place-items-center rounded-md border bg-card text-[0.72rem] font-semibold text-muted-foreground";

export function ApprovalActions({ onReject, onAsk, onApprove }: Props) {
  return (
    <>
      <div className="mt-6 grid w-full grid-cols-2 gap-2 sm:grid-cols-[1fr_1.3fr_1fr]">
        <Button
          type="button"
          variant="outline"
          className="col-start-1 row-start-1 text-destructive sm:col-auto sm:row-auto sm:px-3"
          onClick={onReject}
        >
          <X /> Reject
        </Button>
        <Button type="button" variant="outline" className="col-span-2 sm:col-auto sm:px-3" onClick={onAsk}>
          <Pencil /> Ask for changes
        </Button>
        <Button
          type="button"
          className="col-start-2 row-start-1 bg-success text-white hover:brightness-105 sm:col-auto sm:row-auto sm:px-3"
          onClick={onApprove}
        >
          <Check /> Approve
        </Button>
      </div>
      <p className="mt-4 hidden items-center justify-center gap-1.5 text-[0.8125rem] text-muted-foreground lg:flex">
        <kbd className={kbd}>&larr;</kbd> reject <kbd className={kbd}>&rarr;</kbd> approve <kbd className={kbd}>E</kbd> ask for changes{" "}
        <kbd className={kbd}>Space</kbd><span>full post</span>
      </p>
    </>
  );
}
