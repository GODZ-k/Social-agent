import { cn, readableOn } from "@repo/ui/lib/utils";

/** A brand's initial on its own colour. A light colour gets a dark letter. */
export function BrandMark({ name, color, className }: { name: string; color: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("grid size-7.5 shrink-0 place-items-center rounded-full text-xs font-semibold", className)}
      style={{ background: color, color: readableOn(color) }}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
