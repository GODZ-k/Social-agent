import { CircleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

/** The line under a field. As an error it gets an icon so the colour is not the only signal. */
export function FieldNote({ id, error, children, className }: { id?: string; error?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <p id={id} className={cn("flex items-start gap-1.5 text-[0.8125rem] leading-[1.45] text-muted-foreground", error && "text-destructive", className)}>
      {error ? <CircleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden /> : null}
      <span>{children}</span>
    </p>
  );
}
