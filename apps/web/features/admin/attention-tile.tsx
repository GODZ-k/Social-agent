import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const TONE_CLASS = {
  bad: "bg-destructive/12 text-destructive",
  warning: "bg-warning/14 text-warning",
  clear: "bg-secondary text-muted-foreground",
} as const;

/**
 * One "what needs you" tile. Below `lg` it's a compact row (icon, count and
 * label, link), no detail line; from `lg` up the icon spans a taller card
 * with the detail line shown, as the design shows at each width.
 */
export function AttentionTile({
  icon: Icon,
  tone,
  count,
  label,
  detail,
  href,
  linkLabel,
}: {
  icon: LucideIcon;
  tone: "warning" | "bad" | "clear";
  count: number;
  label: string;
  detail: string;
  href?: string;
  linkLabel?: string;
}) {
  const content = (
    <>
      <span
        className={cn(
          "grid size-10 shrink-0 place-items-center self-center rounded-full lg:row-span-3 lg:self-start",
          TONE_CLASS[tone],
        )}
      >
        <Icon className="size-4.5" />
      </span>
      <p className="type-number min-w-0 self-center text-xl lg:self-auto lg:text-2xl">
        {count} <small className="font-normal text-foreground">{label}</small>
      </p>
      <p className="type-label hidden min-w-0 lg:line-clamp-2 lg:block">{detail}</p>
      {href && count > 0 && linkLabel && (
        <span className="type-label inline-flex min-w-0 shrink-0 items-center gap-0.5 self-center font-medium text-tint-foreground lg:mt-0.5 lg:self-auto">
          {linkLabel}
          <ChevronRight className="size-3.5" />
        </span>
      )}
    </>
  );

  const className = "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3.5 gap-y-1 rounded-xl bg-card p-5 shadow-raised lg:grid-cols-[auto_minmax(0,1fr)] lg:items-start";

  if (href && count > 0) {
    return (
      <Link href={href} className={cn(className, "hover:shadow-floating")}>
        {content}
      </Link>
    );
  }
  return <div className={className}>{content}</div>;
}
