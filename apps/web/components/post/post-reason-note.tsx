import { Sparkles } from "lucide-react";

/** Why the agent made this post, shown to the approver on every review surface. */
export function PostReasonNote({ note }: { note: string }) {
  return (
    <p className="flex gap-2 rounded-md bg-tint p-3 text-[0.8125rem] leading-snug text-tint-foreground">
      <Sparkles className="mt-0.5 size-3.5 shrink-0" />
      <span>
        <span className="font-semibold">Why this post:</span> {note}
      </span>
    </p>
  );
}
