import { cn } from "@/lib/utils";

export function SetupProgress({ step, total = 3 }: { step: number; total?: number }) {
  return (
    <div className="mb-5 flex items-center gap-2.5 text-[0.8125rem] text-muted-foreground">
      <span aria-hidden className="flex gap-1">
        {Array.from({ length: total }, (_, index) => (
          <span key={index} className={cn("h-1 w-6 rounded-full bg-input", index < step && "bg-primary")} />
        ))}
      </span>
      Step {step} of {total}
    </div>
  );
}
