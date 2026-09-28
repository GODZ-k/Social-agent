/** Title and one-line explanation at the top of every auth screen. An optional status icon sits above. */
export function AuthHeading({ icon, title, children }: { icon?: React.ReactNode; title: string; children?: React.ReactNode }) {
  return (
    <>
      {icon}
      <h1 className="text-balance font-display text-[1.75rem] leading-[1.08] font-semibold tracking-[-0.03em] sm:text-[2.125rem]">{title}</h1>
      {children ? <p className="mt-2.5 text-muted-foreground [&_b]:font-medium [&_b]:break-words [&_b]:text-foreground">{children}</p> : null}
    </>
  );
}
