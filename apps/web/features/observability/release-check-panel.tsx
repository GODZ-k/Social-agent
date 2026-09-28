import Link from "next/link";
import { format, parseISO } from "date-fns";
import { AlertCircle, ChevronRight } from "lucide-react";
import type { ObsFrontend } from "@/lib/types";
import { cn } from "@/lib/utils";

/** What the release check's verdict reads as, once the release's own date is folded into the headline. */
const VERDICT_PHRASE = { worse: "made things worse", same: "made no real difference", better: "made things better" } as const;
const VERDICT_TONE = { worse: "bg-tint", same: "bg-secondary", better: "bg-success/10" } as const;

/** Whether the last release made things better, the same, or worse. */
export function ReleaseCheckPanel({
  release,
  releaseCheck,
  newErrorsCount,
}: {
  release: ObsFrontend["release"];
  releaseCheck: ObsFrontend["releaseCheck"];
  newErrorsCount: number;
}) {
  const tone = VERDICT_TONE[releaseCheck.verdict];
  const headline = `The release of ${format(parseISO(release.at), "d MMM, h:mm a")} ${VERDICT_PHRASE[releaseCheck.verdict]}`;
  return (
    <div className={cn("mb-5 grid gap-6 rounded-xl p-5 lg:grid-cols-[1.2fr_1fr] lg:items-center", tone)}>
      <div className="flex items-start gap-3.5">
        <AlertCircle className="mt-0.5 size-4.5 shrink-0 text-tint-foreground" />
        <div className="min-w-0 flex-1">
          <p className="type-heading">{headline}</p>
          <p className="mt-1.5 text-foreground/80">{releaseCheck.detail}</p>
          <div className="mt-3 flex flex-wrap gap-4">
            {newErrorsCount > 0 && (
              <Link href="#errors" className="inline-flex items-center gap-0.5 text-sm font-medium text-tint-foreground hover:underline">
                See the {newErrorsCount} new {newErrorsCount === 1 ? "error" : "errors"} <ChevronRight className="size-3.5" />
              </Link>
            )}
            <Link href="/admin/observability/server" className="inline-flex items-center gap-0.5 text-sm font-medium text-tint-foreground hover:underline">
              Compare releases <ChevronRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-card/70 p-3.5">
          <p className="type-label">Before, 24 hours</p>
          <p className="type-number mt-1 text-2xl">{releaseCheck.before}%</p>
          <p className="type-label">of sessions hit an error</p>
        </div>
        <div className="rounded-2xl bg-card/70 p-3.5">
          <p className="type-label">Since the release</p>
          <p className={cn("type-number mt-1 text-2xl", releaseCheck.verdict === "worse" && "text-destructive")}>{releaseCheck.since}%</p>
          <p className="type-label">of sessions hit an error</p>
        </div>
      </div>
    </div>
  );
}
