import { CircleAlert, CircleCheck, Clock, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const TONES: Record<"error" | "info" | "success" | "warning", { className: string; icon: LucideIcon }> = {
  error: { className: "bg-destructive/8 text-destructive", icon: CircleAlert },
  info: { className: "bg-tint text-tint-foreground", icon: Clock },
  success: { className: "bg-success/10 text-success", icon: CircleCheck },
  warning: { className: "bg-warning/10 text-warning", icon: Clock },
};

/** A message about the whole form. Errors interrupt screen readers; the rest wait their turn. */
export function Notice({ tone, children, className }: { tone: keyof typeof TONES; children: React.ReactNode; className?: string }) {
  const { className: toneClass, icon: Icon } = TONES[tone];
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("mt-6 flex items-start gap-2.5 rounded-lg px-4 py-3.5 text-sm leading-[1.45] [&_a]:text-inherit [&_a]:decoration-current", toneClass, className)}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <p>{children}</p>
    </div>
  );
}
