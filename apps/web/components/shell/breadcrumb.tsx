import Link from "next/link";
import { cn } from "@/lib/utils";

export type Crumb = { label: string; href?: string };

/**
 * The path to a route that sits more than one level deep, for the screens where one "back" link
 * cannot say where you are. The last crumb is where you are, so it carries no link and is marked
 * as the current page.
 *
 * The "/" is the top bar's glyph but not its `CrumbSlash`: that one hides itself under 560px,
 * which is right in the bar (the whole crumb collapses there) and wrong here, where hiding the
 * separator would run the labels together on a phone.
 */
export function Breadcrumb({ trail, className }: { trail: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex min-w-0 flex-wrap items-center gap-1.5 text-sm font-medium text-muted-foreground">
        {trail.map((crumb, index) => {
          const last = index === trail.length - 1;
          return (
            <li key={`${crumb.label}-${index}`} className="flex min-w-0 items-center gap-1.5">
              {crumb.href && !last ? (
                <Link href={crumb.href} className="truncate hover:text-foreground">
                  {crumb.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className={cn("truncate", last && "text-foreground")}>
                  {crumb.label}
                </span>
              )}
              {!last && (
                <span aria-hidden className="leading-none text-input">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
