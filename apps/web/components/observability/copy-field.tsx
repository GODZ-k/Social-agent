"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/** An id shown with a copy button; briefly confirms the copy instead of a toast. */
export function CopyField({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <span className="inline-flex items-center gap-1.5 font-medium">
      {value}
      <button type="button" onClick={copy} aria-label="Copy" className="pressable grid size-6 place-items-center rounded-full text-muted-foreground hover:bg-secondary">
        {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
      </button>
    </span>
  );
}
