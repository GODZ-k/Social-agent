import { cn } from "@/lib/utils";

const PILL = "rounded-md px-1.5 py-0.5 font-mono text-[0.6875rem] font-medium uppercase";

/** An HTTP method, in a pill: POST stands out in the tint colour, every other method is neutral. */
export function MethodBadge({ method }: { method: string }) {
  const writes = method === "POST";
  return <span className={cn(PILL, writes ? "bg-tint text-tint-foreground" : "bg-secondary")}>{method}</span>;
}
