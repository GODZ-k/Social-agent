import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The way one level up, above a nested route's title. One component for what used to be three
 * near-identical copies (observability, strategy, the client header), which had drifted apart on
 * weight and spacing. Spacing stays the caller's to set, since each screen sits it differently.
 */
export function BackLink({ href, label, className }: { href: string; label: string; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      <ArrowLeft aria-hidden className="size-4" /> {label}
    </Link>
  );
}
