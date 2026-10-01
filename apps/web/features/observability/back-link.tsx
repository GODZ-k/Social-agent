import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/** The small "back to the tab" link above a detail page's title. */
export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
      <ArrowLeft className="size-4" /> {label}
    </Link>
  );
}
