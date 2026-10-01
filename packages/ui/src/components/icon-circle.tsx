import { cn } from "../lib/utils";

/**
 * The circular badge that leads an empty state, banner or alert. Only owns the shared shape
 * (`grid place-items-center rounded-full`); the caller composes size and tone through
 * `className` and passes the icon as children, so no variant prop ever picks between looks.
 */
export function IconCircle({ className, children }: { className?: string; children: React.ReactNode }) {
  return <span className={cn("grid shrink-0 place-items-center rounded-full", className)}>{children}</span>;
}
