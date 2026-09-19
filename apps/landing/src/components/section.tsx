import { cn } from "@repo/ui/lib/utils";

/** The top of every page except home: where am I, in one line, then what this page covers. */
export function PageIntro({ title, lead }: { title: string; lead?: string }) {
  return (
    <header className="pt-10 md:pt-16">
      <h1 className="type-title">{title}</h1>
      {lead && <p className="mt-3 max-w-[58ch] text-[1.0625rem] text-muted-foreground">{lead}</p>}
    </header>
  );
}

/** A page-level break: left-aligned heading, an optional lead, then whatever demonstrates it. */
export function Section({
  title,
  lead,
  children,
  className,
  id,
}: {
  title: string;
  lead?: string;
  children?: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("mt-24 scroll-mt-24 md:mt-32", className)}>
      <h2 className="type-title">{title}</h2>
      {lead && <p className="mt-3 max-w-[58ch] text-muted-foreground">{lead}</p>}
      {children && <div className="mt-8">{children}</div>}
    </section>
  );
}
