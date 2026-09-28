import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const TONES = {
  brand: "bg-tint text-tint-foreground",
  success: "bg-success/12 text-success",
  warning: "bg-warning/14 text-warning",
  danger: "bg-destructive/10 text-destructive",
} as const;

export function StatusIcon({ icon: Icon, tone = "brand" }: { icon: LucideIcon; tone?: keyof typeof TONES }) {
  return (
    <div className={cn("mb-6 grid size-13 place-items-center rounded-[1.125rem]", TONES[tone])}>
      <Icon className="size-6" aria-hidden />
    </div>
  );
}
