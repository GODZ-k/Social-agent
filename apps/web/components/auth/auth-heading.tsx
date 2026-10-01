/**
 * Title and one-line explanation at the top of every auth screen. An optional status icon sits above.
 *
 * `level` picks the real tag. An auth page owns its `<h1>`; the same wizard reused inside the
 * account dialog sits under that dialog's own `<h2>` title, so there it renders an `<h2>` rather
 * than an `<h1>` using `aria-level` to claim it is something its tag is not.
 */
export function AuthHeading({ icon, title, level = 1, children }: { icon?: React.ReactNode; title: string; level?: 1 | 2; children?: React.ReactNode }) {
  const Tag = level === 1 ? "h1" : "h2";
  return (
    <>
      {icon}
      <Tag className="text-balance font-display text-[1.75rem] leading-[1.08] font-semibold tracking-[-0.03em] sm:text-[2.125rem]">{title}</Tag>
      {children ? <p className="mt-2.5 text-muted-foreground [&_b]:font-medium [&_b]:break-words [&_b]:text-foreground">{children}</p> : null}
    </>
  );
}
