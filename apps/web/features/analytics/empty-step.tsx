/** One numbered thing standing between the brand and its first numbers, with the action that clears it. */
export function EmptyStep({
  number,
  title,
  body,
  children,
}: {
  number: number;
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3.5 rounded-2xl p-4 shadow-raised">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-tint text-[0.8125rem] font-semibold text-tint-foreground">
        {number}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium">{title}</p>
        <p className="type-label mt-0.5">{body}</p>
      </div>
      {children}
    </div>
  );
}
