/** Below 1024px, the admin area's two places sit in a compact centred pill, not the full-width bar a workspace's five use. */
export function AdminTabBarFrame({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <nav
      aria-label={label}
      className="material fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-1/2 z-40 grid w-[min(20rem,calc(100vw-1.5rem))] -translate-x-1/2 auto-cols-fr grid-flow-col rounded-[1.75rem] p-1.5 lg:hidden"
    >
      {children}
    </nav>
  );
}
