import { cn } from "@/lib/utils";
import { avatarColor } from "./format";

/** The small labels observability rows are built from, plus the shared toolbar pill. */

/** The toolbar's pill-shaped button: range, filter and release pickers, and the SigNoz link, all match this. */
export const TOOLBAR_PILL_CLASS =
  "inline-flex items-center gap-1.5 rounded-full border bg-card px-3.5 py-1.5 text-[0.8125rem] font-medium hover:bg-accent";

const PILL = "rounded-md px-1.5 py-0.5 font-mono text-[0.6875rem] font-medium uppercase";

/** An HTTP method, in a pill: POST stands out in the tint colour, every other method is neutral. */
export function MethodBadge({ method }: { method: string }) {
  const writes = method === "POST";
  return <span className={cn(PILL, writes ? "bg-tint text-tint-foreground" : "bg-secondary")}>{method}</span>;
}

/** A client's initial in a coloured circle, then its name. */
export function BrandBadge({ name }: { name: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        aria-hidden
        className="grid size-5 shrink-0 place-items-center rounded-full text-[0.625rem] font-semibold text-white"
        style={{ background: avatarColor(name) }}
      >
        {name.charAt(0)}
      </span>
      {name}
    </span>
  );
}
