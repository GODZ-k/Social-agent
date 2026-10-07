import { cn } from "@/lib/utils";

/** A client's (person's) initials. Invited people get a dashed ring until they sign in. */
export function PersonAvatar({ name, email, invited, className }: { name: string | null; email: string; invited?: boolean; className?: string }) {
  const source = name ?? email;
  const initials = source
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-11 shrink-0 place-items-center rounded-full text-sm font-semibold",
        invited ? "bg-card text-muted-foreground ring-1 ring-dashed ring-border" : "bg-tint text-tint-foreground",
        className,
      )}
    >
      {initials}
    </span>
  );
}
