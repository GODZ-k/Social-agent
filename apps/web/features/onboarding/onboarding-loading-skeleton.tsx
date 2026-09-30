import { cn } from "@/lib/utils";

/**
 * S00a: bones of `OnboardingFlow`'s website step (headline, `UrlForm`, `StartJourney`'s 3 cards),
 * shown by `loading.tsx` while `/onboarding` and the admin "add a brand" route fetch their data.
 * `loading.js` gets no props (not even `searchParams`), so it can't tell a first-time visit from
 * one resuming with `?clientId=` — this is the shape for the far more common first-time case; a
 * resuming visit briefly shows this shape too before the real journey swaps in.
 */
export function OnboardingLoadingSkeleton() {
  return (
    <div aria-busy aria-label="Loading" className="text-center">
      <div className="mx-auto max-w-[46rem]">
        <div className="skeleton mx-auto h-9 w-[22rem] max-w-full rounded-full sm:h-10" />
        <div className="skeleton mx-auto mt-4 h-4 w-[28rem] max-w-full rounded-full" />
        <div className="mx-auto mt-8 max-w-xl text-left">
          <div className="flex flex-col items-stretch gap-2 rounded-[1.5rem] bg-card p-2 shadow-floating ring-1 ring-border sm:flex-row sm:items-center sm:gap-2 sm:rounded-full sm:p-1.5 sm:pl-5">
            <div className="flex min-h-11 min-w-0 flex-1 items-center gap-2 px-2.5 sm:min-h-0 sm:px-0">
              <div className="skeleton size-5 shrink-0 rounded-full" />
              <div className="skeleton h-4 w-2/3 rounded-full" />
            </div>
            <div className="skeleton h-11 w-full rounded-full sm:w-36" />
          </div>
          <div className="skeleton mt-3 ml-5 h-3.5 w-56 max-w-full rounded-full" />
        </div>
      </div>

      <div className="relative mx-auto mt-14 max-w-[34rem] min-[901px]:max-w-[60rem]">
        <div className="grid grid-cols-1 gap-3 text-left min-[901px]:grid-cols-3 min-[901px]:gap-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                "grid grid-cols-[2.5rem_1fr] items-start gap-x-3 rounded-[1.375rem] p-5 min-[901px]:block min-[901px]:p-5.5 bg-card shadow-raised",
              )}
            >
              <div className="skeleton row-span-3 size-7 rounded-full min-[901px]:row-span-1 min-[901px]:mb-4" />
              <div className="skeleton h-4 w-4/5 rounded-full" />
              <div className="mt-1 grid gap-1.5">
                <div className="skeleton h-3 w-full rounded-full" />
                <div className="skeleton h-3 w-3/5 rounded-full" />
              </div>
              <div className="skeleton mt-3.5 h-3 w-24 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      <div className="skeleton mx-auto mt-10 h-4 w-64 max-w-full rounded-full" />
    </div>
  );
}
