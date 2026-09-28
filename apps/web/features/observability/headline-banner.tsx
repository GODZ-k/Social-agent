import Link from "next/link";
import { formatDistanceToNow, parseISO } from "date-fns";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** The one-line read of how the system is doing, with a dot in a ring coloured by severity. */
export function HeadlineBanner({
  title,
  detail,
  tone,
  checkedAt,
  href,
  linkLabel,
}: {
  title: string;
  detail: string;
  tone: "ok" | "warning" | "bad";
  checkedAt: string;
  href?: string;
  linkLabel?: string;
}) {
  const dot = tone === "bad" ? "bg-destructive ring-destructive/14" : tone === "warning" ? "bg-warning ring-warning/14" : "bg-success ring-success/14";
  return (
    <div className="mb-5 flex flex-col items-start justify-between gap-4 rounded-xl bg-card p-5 shadow-raised lg:flex-row lg:items-center">
      <div className="flex items-center gap-3.5">
        <span aria-hidden className={cn("size-2.5 shrink-0 rounded-full ring-[5px]", dot)} />
        <div>
          <p className="type-heading">{title}</p>
          <p className="type-label mt-1">
            {detail} Checked {formatDistanceToNow(parseISO(checkedAt), { addSuffix: true })}.
          </p>
        </div>
      </div>
      {href && (
        <Link href={href} className="inline-flex shrink-0 items-center gap-0.5 text-sm font-medium text-tint-foreground hover:underline">
          {linkLabel} <ChevronRight className="size-3.5" />
        </Link>
      )}
    </div>
  );
}
