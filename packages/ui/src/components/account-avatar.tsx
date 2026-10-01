import { cn } from "../lib/utils";

/** The signed-in person's initials. The size comes from the caller. */
export function AccountAvatar({ name, className }: { name: string; className?: string }) {
  const words = name.trim().split(/\s+/).slice(0, 2);
  const initials = words.map((word) => word.charAt(0).toUpperCase()).join("");
  return (
    <span
      aria-hidden
      className={cn("grid shrink-0 place-items-center rounded-full bg-tint-strong font-semibold text-tint-foreground", className)}
    >
      {initials}
    </span>
  );
}
