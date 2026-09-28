import { Panel } from "@repo/ui/components/states";

/** A panel that isn't ready to show numbers yet, and says plainly when it will be. */
export function SoonPanel({
  title,
  description,
  icon,
  heading,
  body,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  heading: string;
  body: string;
}) {
  return (
    <Panel aria-label={title}>
      <h2 className="type-heading">{title}</h2>
      <p className="type-label mt-0.5">{description}</p>
      <div className="mt-4 flex items-start gap-4 rounded-xl bg-secondary/60 p-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-tint text-tint-foreground [&_svg]:size-4">{icon}</span>
        <div>
          <p className="font-medium">{heading}</p>
          <p className="type-label mt-1">{body}</p>
        </div>
      </div>
    </Panel>
  );
}
