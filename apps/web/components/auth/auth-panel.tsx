/**
 * The desktop-only brand panel beside every signed-out form: a picture on top, one message under it.
 *
 * `heading` and `body` take nodes so a `loading.tsx` can sketch them; every real caller passes text.
 */
export function AuthPanel({
  label,
  heading,
  body,
  children,
}: {
  label: string;
  heading: React.ReactNode;
  body: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <aside
      aria-label={label}
      className="sticky top-3 m-3 ml-0 hidden h-[calc(100dvh-1.5rem)] min-h-160 flex-col justify-center gap-11 overflow-hidden rounded-2xl bg-tint p-14 lg:flex"
    >
      <div className="relative mx-auto w-76 max-w-full">{children}</div>
      <div className="mx-auto max-w-100 text-center">
        {/* A fixed deep indigo, not the theme's tint-foreground: this panel is the app's own brand voice, not a brand's. */}
        <h2 className="text-balance font-display text-[1.75rem] leading-[1.12] font-semibold tracking-[-0.025em] text-[#231d6e] dark:text-tint-foreground">
          {heading}
        </h2>
        <p className="mt-3 text-muted-foreground">{body}</p>
      </div>
    </aside>
  );
}
