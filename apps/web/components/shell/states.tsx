import { CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
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

export function Panel({ className, ...props }: React.ComponentProps<"section">) {
  return <section className={cn("rounded-xl bg-card p-5 shadow-raised md:p-6", className)} {...props} />;
}

/** Says what went wrong and offers the one thing that can fix it. */
export function ErrorState({ error, onRetry }: { error: Error; onRetry?: () => void }) {
  return (
    <div role="alert" className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
      <CircleAlert className="size-7 text-destructive" />
      <p className="type-heading">This didn&apos;t load</p>
      <p className="text-muted-foreground">{error.message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="mt-2">
          Try again
        </Button>
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
      {icon && <div className="mb-1 grid size-12 place-items-center rounded-full bg-tint text-tint-foreground [&_svg]:size-5">{icon}</div>}
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
