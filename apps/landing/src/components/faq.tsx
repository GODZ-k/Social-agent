import { ChevronDown } from "lucide-react";
import type { QA } from "@/lib/content/faq";

/** Native disclosure elements: keyboard and screen-reader behaviour come for free, and no script is needed. */
export function Faq({ items }: { items: QA[] }) {
  return (
    <div className="max-w-3xl divide-y divide-border border-y border-border">
      {items.map((item) => (
        <details key={item.q} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-sm py-4 font-medium [&::-webkit-details-marker]:hidden">
            {item.q}
            <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden />
          </summary>
          <p className="max-w-[62ch] pb-5 text-muted-foreground">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
