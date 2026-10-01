import { cn } from "../lib/utils";

/**
 * A panel's opening line: title and description on the left, an optional slot on the
 * right (a count, a toggle, whatever the panel leads with). Shared by admin settings
 * and observability so the two stop hand-rolling the same row.
 */
export function PanelHeader({
  title,
  description,
  right,
  align = "start",
  className,
}: {
  title: string;
  description: string;
  right?: React.ReactNode;
  /** "baseline" lines up the title with the right slot's first line instead of both blocks' tops. */
  align?: "start" | "baseline";
  className?: string;
}) {
  return (
    <div className={cn("mb-4 flex justify-between gap-3", align === "baseline" ? "items-baseline" : "items-start", className)}>
      <div>
        <h2 className="type-heading">{title}</h2>
        <p className="type-label mt-1">{description}</p>
      </div>
      {right}
    </div>
  );
}
