import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

/** "up 0.4 pts" or "down $0.40", coloured good or bad depending on whether up is good here. */
export function TrendDelta({
  delta,
  label,
  format,
  goodWhen = "down",
}: {
  delta: number;
  label: string;
  format: (n: number) => string;
  /** Whether a rise or a fall is the good direction for this metric. */
  goodWhen?: "up" | "down";
}) {
  if (delta === 0) return <span>No change {label}</span>;
  const up = delta > 0;
  const good = up ? goodWhen === "up" : goodWhen === "down";
  const Icon = up ? ArrowUp : ArrowDown;
  return (
    <>
      <span className={cn("flex items-center gap-1 font-medium", good ? "text-success" : "text-destructive")}>
        <Icon className="size-3.5" />
        {format(Math.abs(delta))}
      </span>
      <span>{label}</span>
    </>
  );
}
