import { Logo } from "./logo";

/** The bar itself, shared by the real top bar and its loading placeholder so the chrome never shifts. */
export function TopBarFrame({ children }: { children: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-40 px-3 pt-3 md:px-5">
      <div className="material mx-auto flex h-14 max-w-[88rem] items-center gap-2 rounded-full pr-2 pl-4 md:gap-3">
        <Logo />
        {children}
      </div>
    </header>
  );
}
