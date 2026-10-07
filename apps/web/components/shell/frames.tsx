import { Logo } from "./logo";

/**
 * The shell's empty shapes: the bar, the rail, the two tab bars, and the two separators that sit
 * inside the bar. None of them know anything about the app — they are the chrome's geometry, shared
 * by the real headers and by the loading placeholders so nothing shifts when a page resolves.
 */

/** The bar itself, shared by every header and the loading placeholder, so the chrome never shifts. */
export function TopBarFrame({ children, wordmark }: { children: React.ReactNode; wordmark?: boolean }) {
  return (
    <header className="sticky top-0 z-40 px-3 pt-3 md:px-5 max-[560px]:px-4">
      <div className="material mx-auto flex h-14 max-w-[88rem] min-w-0 items-center gap-2.5 rounded-full pr-2 pl-4 max-[560px]:gap-1.5 max-[560px]:pr-1.5 max-[560px]:pl-3">
        <Logo wordmark={wordmark} />
        {children}
      </div>
    </header>
  );
}

/** The desktop rail: floats beside the content, translucent so content scrolls underneath. */
export function RailFrame({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <nav aria-label={label} className="material fixed top-24 left-5 z-40 hidden w-52 flex-col gap-0.5 rounded-xl p-2 lg:flex">
      {children}
    </nav>
  );
}

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

export function BarDivider() {
  return <span className="h-5 w-px shrink-0 bg-border" aria-hidden />;
}

/** The "/" between a back link and what it leads to, hidden once the bar is tight. */
export function CrumbSlash() {
  return (
    <span aria-hidden className="text-lg leading-none text-input max-[560px]:hidden">
      /
    </span>
  );
}
