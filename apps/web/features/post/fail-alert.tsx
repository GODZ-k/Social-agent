import { format, parseISO } from "date-fns";
import { RefreshCw, TriangleAlert } from "lucide-react";

/** The red alert box on a failed post's panel (FL-2): what went wrong, and when it was tried. */
export function FailAlert({ heading, triedAt, children }: { heading: string; triedAt: string; children: React.ReactNode }) {
  return (
    <div role="alert" className="rounded-2xl bg-destructive/12 p-4.5">
      <h3 className="flex items-start gap-2 text-[1rem] font-semibold leading-snug">
        <TriangleAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
        {heading}
      </h3>
      <div className="mt-1.5 text-[0.875rem] leading-relaxed">{children}</div>
      <p className="mt-2.5 flex items-center gap-1.5 text-[0.8125rem] text-muted-foreground">
        <RefreshCw className="size-3.5" />
        Tried at {format(parseISO(triedAt), "h:mm a 'on' EEEE")}.
      </p>
    </div>
  );
}
