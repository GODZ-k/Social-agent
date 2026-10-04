import { Panel } from "@repo/ui/components/states";

/**
 * Mirrors `ApprovalStack` and `PostSidePanel`: the swipe card stack on the left (decide
 * buttons held back until a post is there), the full post panel on wide screens on the
 * right (ST-3 "approvals").
 */
export default function ApprovalsLoading() {
  return (
    <>
      {/* The subtitle is desktop-only: the tablet and phone layout fits the whole stack on one screen. */}
      <header className="mb-7 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="min-w-0 max-w-[60ch]">
          <h1 className="type-title">Approvals</h1>
          <p className="mt-2 hidden text-muted-foreground lg:block">
            Swipe right to approve, left to reject. Nothing is published without you.
          </p>
        </div>
      </header>

      <div className="grid items-start gap-x-10 gap-y-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]" aria-busy aria-label="Loading posts to approve">
        <div className="mx-auto flex w-full max-w-[26rem] flex-col items-center lg:mx-0">
          <div className="mb-3 w-full">
            <div className="skeleton h-3.5 w-20" />
          </div>
          <div className="relative h-[clamp(20rem,calc(100dvh-27rem),36rem)] w-full pb-8 lg:h-[clamp(22rem,calc(100dvh-26rem),40rem)]">
            <div className="absolute inset-x-4 bottom-6 h-full translate-y-3.5 scale-95 rounded-[1.75rem] bg-card opacity-75 shadow-floating" />
            <div className="absolute inset-x-2 bottom-2 h-full translate-y-1.75 scale-[0.97] rounded-[1.75rem] bg-card opacity-90 shadow-floating" />
            <div className="absolute inset-0 flex flex-col gap-3 rounded-[1.75rem] bg-card p-3.5 shadow-floating">
              <div className="flex gap-2">
                <div className="skeleton h-7 w-16 rounded-full" />
                <div className="skeleton h-7 w-24 rounded-full" />
                <div className="skeleton h-7 w-20 rounded-full" />
              </div>
              <div className="skeleton flex-1 rounded-2xl" />
              <div className="grid gap-1.5">
                <div className="skeleton h-3.5 w-11/12" />
                <div className="skeleton h-3.5 w-2/3" />
              </div>
            </div>
          </div>
          <p className="type-label mt-8 flex w-full items-center justify-between">
            <span className="skeleton h-3 w-28" />
            <span className="skeleton h-3 w-32" />
          </p>
          <div className="mt-3 grid w-full grid-cols-3 gap-2">
            <div className="skeleton h-12 rounded-full" />
            <div className="skeleton h-12 rounded-full" />
            <div className="skeleton h-12 rounded-full" />
          </div>
        </div>

        <aside className="hidden lg:block" aria-hidden="true">
          <Panel>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <div className="skeleton h-5.5 w-64 max-w-full" />
                <div className="skeleton h-3.5 w-36" />
              </div>
              <div className="flex gap-2">
                <div className="skeleton h-4 w-20 rounded-full" />
                <div className="skeleton h-4 w-16 rounded-full" />
              </div>
              <div className="grid gap-2 rounded-2xl bg-secondary p-4">
                <div className="skeleton h-3.5 w-20 bg-card" />
                <div className="skeleton h-6 w-52 max-w-full bg-card" />
                <div className="skeleton h-3.5 w-24 bg-card" />
                <div className="mt-1 flex gap-2">
                  <div className="skeleton h-8 w-20 rounded-full bg-card" />
                  <div className="skeleton h-8 w-20 rounded-full bg-card" />
                  <div className="skeleton h-8 w-20 rounded-full bg-card" />
                </div>
              </div>
              <div className="grid gap-2">
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-11/12" />
                <div className="skeleton h-4 w-2/5" />
              </div>
              <div className="flex gap-2.5">
                <div className="skeleton h-10 w-28 rounded-full" />
                <div className="skeleton h-10 w-44 rounded-full" />
              </div>
            </div>
          </Panel>
        </aside>
      </div>
    </>
  );
}
