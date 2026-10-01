import Link from "next/link";
import { ChevronLeft } from "lucide-react";

/** While adding a brand, the way back to the brand the brand came from. Keeps its words on phones. */
export function BrandBackLink({ brand }: { brand: { id: string; name: string } }) {
  return (
    <Link
      href={`/c/${brand.id}`}
      className="pressable inline-flex h-8.5 min-w-0 items-center gap-1 rounded-full pr-3 pl-2 text-[0.8125rem] font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
    >
      <ChevronLeft aria-hidden className="size-4 shrink-0" />
      <span className="truncate">Back to {brand.name}</span>
    </Link>
  );
}
