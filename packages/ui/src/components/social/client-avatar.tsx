import type { Client } from "./types";
import { cn, readableOn } from "../../lib/utils";

/** A client's initial on their own brand colour. Stands in for a logo. */
export function ClientAvatar({
  client,
  className,
}: {
  client: Pick<Client, "name" | "accent">;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-[30%] font-display text-[0.95em] font-semibold",
        className,
      )}
      style={{ background: client.accent, color: readableOn(client.accent) }}
    >
      {client.name.charAt(0)}
    </span>
  );
}
