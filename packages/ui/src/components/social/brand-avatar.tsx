import type { Brand } from "./types";
import { cn, readableOn } from "../../lib/utils";

/** A brand's initial on its own colour. Stands in for a logo. */
export function BrandAvatar({
  brand,
  className,
}: {
  brand: Pick<Brand, "name" | "accent">;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-[30%] font-display text-[0.95em] font-semibold",
        className,
      )}
      style={{ background: brand.accent, color: readableOn(brand.accent) }}
    >
      {brand.name.charAt(0)}
    </span>
  );
}
