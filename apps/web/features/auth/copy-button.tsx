"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { cn } from "@/lib/utils";

/** Copies for real and says so for two seconds. */
export function CopyButton({ text, label, className }: { text: string; label: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked; the text is selectable, so nothing is lost.
    }
  }

  return (
    <Button type="button" variant="outline" className={cn(copied && "text-success", className)} onClick={copy}>
      {copied ? <Check /> : <Copy />}
      <span aria-live="polite">{copied ? "Copied" : label}</span>
    </Button>
  );
}
