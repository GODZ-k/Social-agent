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
      <div className="skeleton mx-auto h-[clamp(20rem,calc(100dvh-27rem),36rem)] w-full max-w-[26rem] rounded-2xl lg:mx-0 lg:h-[clamp(22rem,calc(100dvh-26rem),40rem)]" />
    </>
  );
}
