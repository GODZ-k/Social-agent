import { Logo } from "./logo";

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
