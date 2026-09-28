/** Below 1024px the rail becomes a tab bar within thumb reach. */
export function TabBarFrame({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <nav
      aria-label={label}
      className="material fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 grid auto-cols-fr grid-flow-col rounded-[1.75rem] p-1.5 lg:hidden"
    >
      {children}
    </nav>
  );
}
