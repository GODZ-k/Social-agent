import { cn } from "../lib/utils";

/** Three bars at a posting rhythm: short, long, medium. Placeholder until the brand is decided. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-6 text-brand-ink", className)} aria-hidden>
      <rect x="3" y="9" width="4.5" height="10" rx="2.25" fill="currentColor" opacity=".55" />
      <rect x="9.75" y="4" width="4.5" height="15" rx="2.25" fill="currentColor" />
      <rect x="16.5" y="7" width="4.5" height="12" rx="2.25" fill="currentColor" opacity=".8" />
    </svg>
  );
}
