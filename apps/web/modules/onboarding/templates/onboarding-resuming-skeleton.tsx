/**
 * S00b: the frame connect, the questionnaire and research all share (a step bar, then a panel —
 * sometimes with a side panel) — deliberately generic, since which of the three it's about to be
 * isn't known until `OnboardingEntry`'s suspended fetch resolves. Mirrors `OnboardingSteps`' real
 * markup for the step bar and `Panel`'s real card styling for the two placeholder panels, so it
 * lines up with whichever real step swaps in.
 */
export function OnboardingResumingSkeleton() {
  return (
    <div aria-busy aria-label="Loading">
      <nav aria-label="Onboarding steps" className="mx-auto mb-8 flex max-w-3xl items-center justify-center gap-2 sm:gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex min-w-0 items-center gap-2 sm:gap-3">
            {i > 0 && <span className="h-px w-4 shrink-0 bg-border sm:w-8" aria-hidden />}
            <span className="flex min-w-0 items-center gap-2">
              <span className="skeleton size-6 shrink-0 rounded-full" />
              <span className="skeleton hidden h-3.5 w-20 rounded-full sm:inline-block" />
            </span>
          </div>
        ))}
      </nav>

      <div className="mx-auto grid max-w-3xl gap-5 lg:max-w-[62rem] lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="rounded-xl bg-card p-5 shadow-raised md:p-6">
          <div className="skeleton h-5 w-40 rounded-full" />
          <div className="mt-6 grid gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3.5 border-t py-3.5 first:border-t-0 first:pt-0">
                <div className="skeleton mt-0.5 size-6 shrink-0 rounded-full" />
                <div className="grid flex-1 gap-1.5">
                  <div className="skeleton h-4 w-3/5 rounded-full" />
                  <div className="skeleton h-3 w-4/5 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="hidden rounded-xl bg-card p-5 shadow-raised md:p-6 lg:block">
          <div className="skeleton h-4 w-24 rounded-full" />
          <div className="mt-4 grid gap-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="border-t py-2.5 first:border-t-0 first:pt-0">
                <div className="skeleton h-3 w-16 rounded-full" />
                <div className="skeleton mt-1.5 h-3.5 w-28 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
