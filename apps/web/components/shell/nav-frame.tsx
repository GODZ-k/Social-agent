import { cn } from "@/lib/utils";

/**
 * The nav's container: a floating rail beside the content on wide screens, a
 * tab bar within thumb reach on phones. Shared with the loading placeholder.
 */
export function NavFrame({ children }: { children: React.ReactNode }) {
  return (
    <nav
      aria-label="Workspace"
      className={cn(
        "material fixed z-40 flex",
        "inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] justify-between rounded-[1.75rem] p-1.5",
        "lg:inset-x-auto lg:top-24 lg:bottom-auto lg:left-5 lg:w-52 lg:flex-col lg:justify-start lg:gap-0.5 lg:rounded-xl lg:p-2",
      )}
    >
      {children}
    </nav>
  );
}
