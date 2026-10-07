"use client";

import { useState } from "react";
import { ArrowLeft, CircleAlert, Copy, Check } from "lucide-react";
import { Button } from "./button";
import { IconCircle } from "./icon-circle";
import { cn } from "../lib/utils";

/** Only used where a caller doesn't pass its own `supportEmail`. */
const DEFAULT_SUPPORT_EMAIL = "support@thescaleagency.org";

/** Short id for the person to quote to support. Prefers Next.js's own digest; falls back for errors caught without one. */
function referenceFor(error: Error & { digest?: string }) {
  return error.digest ?? Math.floor(1_000_000_000 + Math.random() * 9_000_000_000).toString();
}

/**
 * The reference id plus its copy-to-clipboard state, shared by `ErrorReference`
 * and `ErrorState` so the two don't keep their own copies of the same clipboard
 * dance (and the same 2s "Copied" timeout).
 */
function useCopyableReference(error: Error & { digest?: string }) {
  const [reference] = useState(() => referenceFor(error));
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable; the reference is still visible to copy by hand
    }
  }

  return { reference, copied, copy };
}

/** The reference pill's own copy button: identical in `ErrorReference` and `ErrorState`. */
function CopyReferenceButton({ reference, copied, onCopy }: { reference: string; copied: boolean; onCopy: () => void }) {
  return (
    <Button variant="outline" size="sm" onClick={onCopy} aria-label={`Copy reference ${reference}`}>
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}

type StateMarkKind = "missing" | "error" | "done";

const MARK_TINT: Record<StateMarkKind, string> = {
  missing: "bg-tint",
  error: "bg-destructive/10",
  done: "bg-success/10",
};

/**
 * The three Cadence bars re-told as a state: a dashed outline (missing), the middle bar
 * fallen over (error), or a tick (done). Mirrors the approved system-states mark
 * (`design/web-v2/system_states.py` `mark()`); its two placeholder greys become
 * `--muted-foreground` since no closer token exists.
 */
export function StateMark({ kind }: { kind: StateMarkKind }) {
  return (
    <div aria-hidden="true" className={cn("mx-auto mb-6 grid size-22 place-items-center rounded-[1.75rem]", MARK_TINT[kind])}>
      <svg viewBox="0 0 72 72" className="size-14">
        {kind === "done" ? (
          <>
            <rect x="12" y="30" width="11" height="28" rx="5.5" fill="var(--success)" opacity=".55" />
            <rect x="49" y="24" width="11" height="34" rx="5.5" fill="var(--success)" opacity=".8" />
            <rect x="30.5" y="14" width="11" height="44" rx="5.5" fill="var(--success)" />
            <circle cx="56" cy="17" r="11" fill="var(--success)" stroke="var(--card)" strokeWidth="3" />
            <path d="M51 17l3.5 3.5 6.5-7" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </>
        ) : kind === "error" ? (
          <>
            <rect x="12" y="30" width="11" height="28" rx="5.5" fill="var(--muted-foreground)" opacity=".4" />
            <rect x="49" y="24" width="11" height="34" rx="5.5" fill="var(--muted-foreground)" opacity=".55" />
            <rect x="30.5" y="35" width="11" height="23" rx="5.5" fill="var(--destructive)" />
            <rect x="30.5" y="12" width="11" height="17" rx="5.5" fill="var(--destructive)" opacity=".75" transform="rotate(-22 36 20.5) translate(-3 0)" />
          </>
        ) : (
          <>
            <rect x="12" y="30" width="11" height="28" rx="5.5" fill="var(--brand)" opacity=".55" />
            <rect x="49" y="24" width="11" height="34" rx="5.5" fill="var(--brand)" opacity=".8" />
            <rect x="30.5" y="13.5" width="11" height="44" rx="5.5" fill="none" stroke="var(--muted-foreground)" strokeWidth="2" strokeDasharray="4 4" />
          </>
        )}
      </svg>
    </div>
  );
}

/**
 * A browser-back control for boundaries with nothing to retry (not-found pages), which is why
 * they carry no `reset` callback and so no `ErrorReference` either.
 */
export function GoBackButton({ children = "Go back" }: { children?: React.ReactNode }) {
  return (
    <Button variant="outline" onClick={() => window.history.back()}>
      <ArrowLeft /> {children}
    </Button>
  );
}

/**
 * The support reference pill (design rule ST-1: never the raw error message). Split out of
 * `ErrorState` so a page that writes its own title and lede can still end on the same
 * copy-a-reference block.
 */
export function ErrorReference({
  error,
  /** Defaults to Cadence's own support address; pass another for a white-labelled surface. */
  supportEmail = DEFAULT_SUPPORT_EMAIL,
}: {
  error: Error & { digest?: string };
  supportEmail?: string;
}) {
  const { reference, copied, copy } = useCopyableReference(error);

  return (
    <div className="mt-7 flex flex-col items-center gap-2">
      <div className="flex items-center gap-3 rounded-full bg-secondary py-2 pr-2 pl-4 text-[0.8125rem] text-muted-foreground">
        <span>
          Reference <b className="font-semibold text-foreground tabular-nums">{reference}</b>
        </span>
        <CopyReferenceButton reference={reference} copied={copied} onCopy={copy} />
      </div>
      <p className="max-w-xs text-center text-xs text-muted-foreground">
        If it keeps happening, send this reference to{" "}
        <a href={`mailto:${supportEmail}`} className="font-medium text-tint-foreground underline underline-offset-2">
          {supportEmail}
        </a>
        .
      </p>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-7 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div className="min-w-0 max-w-[60ch]">
        <h1 className="type-title">{title}</h1>
        {description && <p className="mt-2 text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2.5">{actions}</div>}
    </header>
  );
}

/**
 * Like `PageHeader`, but the actions never drop to their own row: title and actions share one
 * row at every width, and the description hides below `lg` instead of wrapping under them.
 * For a header whose action must stay reachable next to the title on a phone (admin's Clients
 * page); everywhere else keeps the default `PageHeader`.
 */
export function PageHeaderInline({
  title,
  description,
  actions,
}: {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-7 flex flex-nowrap items-end justify-between gap-x-4 gap-y-4">
      <div className="min-w-0 max-w-[60ch]">
        <h1 className="type-title">{title}</h1>
        {description && <p className="mt-2 hidden text-muted-foreground lg:block">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2.5">{actions}</div>}
    </header>
  );
}

export function Panel({ className, ...props }: React.ComponentProps<"section">) {
  return <section className={cn("rounded-xl bg-card p-5 shadow-raised md:p-6", className)} {...props} />;
}

/**
 * Says what went wrong and offers the one thing that can fix it. Never shows the raw error
 * message (design rule ST-1) — only a generic line and a support reference to quote. The
 * reference row only shows for real error boundaries (they pass `onRetry`); a not-found copy
 * has nothing to retry and no reference to give.
 */
export function ErrorState({
  error,
  onRetry,
  /** Defaults to Cadence's own support address; pass another for a white-labelled surface. */
  supportEmail = DEFAULT_SUPPORT_EMAIL,
}: {
  error: Error & { digest?: string };
  onRetry?: () => void;
  supportEmail?: string;
}) {
  const { reference, copied, copy } = useCopyableReference(error);
  const showReference = Boolean(onRetry);

  return (
    <div role="alert" className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
      <CircleAlert className="size-7 text-destructive" />
      <p className="type-heading">This didn&apos;t load</p>
      <p className="text-muted-foreground">Something went wrong on our side, not yours.</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="mt-2">
          Try again
        </Button>
      )}
      {showReference && (
        <div className="mt-3 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Reference <span className="font-medium text-foreground tabular-nums">{reference}</span>
            </span>
            <CopyReferenceButton reference={reference} copied={copied} onCopy={copy} />
          </div>
          <p className="text-xs text-muted-foreground">
            If it keeps happening, send this reference to{" "}
            <a href={`mailto:${supportEmail}`} className="underline underline-offset-2">
              {supportEmail}
            </a>
            .
          </p>
        </div>
      )}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-2.5 py-14 text-center">
      {icon && <IconCircle className="mb-1 size-12 bg-tint text-tint-foreground [&_svg]:size-5">{icon}</IconCircle>}
      <p className="type-heading">{title}</p>
      <p className="text-muted-foreground">{description}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function SkeletonRows({ rows = 4, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("grid gap-3", className)} aria-busy aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="skeleton h-16 rounded-xl" style={{ animationDelay: `${i * 90}ms` }} />
      ))}
    </div>
  );
}
