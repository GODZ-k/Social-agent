import { AlertCircle } from "lucide-react";

/** Why a run failed, and what to do about it, in the run's own words. */
export function ProblemBanner({ title, advice }: { title: string; advice: string }) {
  return (
    <div className="mb-5 flex items-start gap-3.5 rounded-xl bg-tint p-5 text-tint-foreground">
      <AlertCircle className="mt-0.5 size-4.5 shrink-0" />
      <div>
        <p className="font-medium">{title}</p>
        <p className="mt-1 text-foreground/80">{advice}</p>
      </div>
    </div>
  );
}
