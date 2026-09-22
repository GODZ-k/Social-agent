import { TopBarFrame } from "./top-bar-frame";
import { NavFrame } from "./nav-frame";

const NAV_ITEMS = 7;

/** Same bar and rail as the real chrome, with placeholders where the client's name and links go. */
export function WorkspaceChromeSkeleton() {
  return (
    <>
      <TopBarFrame>
        <span className="h-5 w-px bg-border" aria-hidden />
        <div className="skeleton h-7 w-32 rounded-full" />
        <div className="ml-auto flex items-center gap-1.5">
          <div className="skeleton h-8.5 w-32 rounded-full max-sm:w-8.5" />
          <div className="skeleton size-8.5 rounded-full" />
          <div className="skeleton size-8 rounded-full" />
        </div>
      </TopBarFrame>
      <NavFrame>
        {Array.from({ length: NAV_ITEMS }, (_, i) => (
          <NavPlaceholder key={i} settings={i === NAV_ITEMS - 1} />
        ))}
      </NavFrame>
    </>
  );
}

/** Settings sits apart at the bottom of the rail and is not in the phone tab bar, like the real link. */
function NavPlaceholder({ settings }: { settings: boolean }) {
  const layout = settings
    ? "hidden lg:mt-2 lg:flex lg:h-10 lg:items-center lg:px-3"
    : "flex flex-1 items-center justify-center py-1.5 lg:h-10 lg:flex-none lg:justify-start lg:px-3 lg:py-2.5";
  return (
    <div className={layout}>
      <div className="skeleton h-5 w-5 rounded-md lg:w-24 lg:rounded-sm" />
    </div>
  );
}
