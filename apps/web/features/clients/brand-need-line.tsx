import Link from "next/link";
import { Button } from "@repo/ui/components/button";

/** BA-1: one thing that needs the owner on a brand tile, above the card's open link. */
export function BrandNeedLine({
  icon,
  title,
  detail,
  actionLabel,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
  actionLabel: string;
  href: string;
}) {
  return (
    <div className="relative z-10 grid min-h-12 grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl bg-warning/8 py-2 pr-2 pl-3 text-sm">
      <span className="grid size-7 place-items-center rounded-full bg-warning/14 text-warning [&_svg]:size-3.5">{icon}</span>
      <div className="min-w-0">
        <b className="font-semibold">{title}</b>
        <small className="type-label block truncate">{detail}</small>
      </div>
      <Button asChild variant="outline" size="sm" className="bg-card">
        <Link href={href}>{actionLabel}</Link>
      </Button>
    </div>
  );
}
