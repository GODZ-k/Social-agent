/** The desktop rail: floats beside the content, translucent so content scrolls underneath. */
export function RailFrame({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <nav
      aria-label={label}
      className="material fixed top-24 left-5 z-40 hidden w-52 flex-col gap-0.5 rounded-xl p-2 lg:flex"
    >
      {children}
    </nav>
  );
}
