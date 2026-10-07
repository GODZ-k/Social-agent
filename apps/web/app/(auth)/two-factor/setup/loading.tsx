import { AuthFrame } from "@/components/auth/auth-frame";
import { SetupProgress } from "@/components/auth/setup-progress";
import { TwoFactorPanel } from "@/components/auth/two-factor-panel";

/**
 * LD-2: turning two-factor on. This route earns its own loading state because the page is `async`
 * and awaits `getViewerRole()` at its top level, so it has no prerenderable shell at all.
 *
 * Setup always opens on the method choice, so the step bar and the two method cards are real, as is
 * the panel's steps card — its three steps are hardcoded in the component. Only what depends on the
 * role being fetched is sketched: the heading, the lede, the panel's copy and the card contents. The
 * client's "Not now" button is left out, because whether it exists is exactly what this page is
 * still waiting to learn.
 */
export default function TwoFactorSetupLoading() {
  return (
    <AuthFrame
      top={<span className="skeleton block h-4 w-20 rounded-full" />}
      promise={<span className="skeleton block h-4 w-64 max-w-full rounded-full" />}
      panel={
        <TwoFactorPanel
          heading={<span className="skeleton mx-auto block h-7 w-80 max-w-full rounded-full" />}
          body={<span className="skeleton mx-auto mt-3 block h-4 w-64 max-w-full rounded-full" />}
        />
      }
    >
      <div role="status" aria-label="Loading">
        <SetupProgress step={1} />
        <div className="skeleton h-9 w-72 max-w-full rounded-full" />
        <div className="skeleton mt-3 h-4 w-full max-w-88 rounded-full" />
        <div className="mt-8 grid min-w-0 gap-3">
          <div className="skeleton h-4 w-56 max-w-full rounded-full" />
          {[0, 1].map((card) => (
            <div
              key={card}
              className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 rounded-[1.125rem] bg-card p-4 shadow-[0_0_0_1px_var(--input)] sm:gap-3.5 sm:px-4.5"
            >
              <div className="skeleton size-10 rounded-[0.875rem]" />
              <div className="min-w-0">
                <div className="skeleton h-4.5 w-32 rounded-full" />
                <div className="skeleton mt-2 h-3.5 w-full rounded-full" />
                <div className="skeleton mt-1.5 h-3.5 w-3/4 rounded-full" />
              </div>
              <div className="mt-0.5 size-5 rounded-full bg-card shadow-[inset_0_0_0_1.5px_var(--input)]" />
            </div>
          ))}
          <div className="skeleton mt-1 h-12 w-full rounded-full" />
        </div>
      </div>
    </AuthFrame>
  );
}
