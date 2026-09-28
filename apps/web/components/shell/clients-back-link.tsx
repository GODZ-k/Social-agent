import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ADMIN_CLIENTS_PATH } from "./admin-nav-items";

/** "‹ Clients" before the brand, like a path. On phones only the chevron stays. */
export function ClientsBackLink() {
  return (
    <Link
      href={ADMIN_CLIENTS_PATH}
      aria-label="Back to all clients"
      className="pressable inline-flex h-8.5 shrink-0 items-center gap-1 rounded-full pr-3 pl-2 text-[0.8125rem] font-medium whitespace-nowrap text-muted-foreground hover:bg-accent hover:text-foreground max-[560px]:w-9 max-[560px]:justify-center max-[560px]:p-0"
    >
      <ChevronLeft aria-hidden className="size-4" />
      <span className="max-[560px]:hidden">Clients</span>
    </Link>
  );
}
