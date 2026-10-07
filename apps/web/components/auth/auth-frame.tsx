import { CircleCheck } from "lucide-react";
import { Logo } from "@/components/shell/logo";
import { AuthFooter } from "./auth-footer";

/**
 * The signed-out frame: logo and one switch link on top, the form in the
 * middle, and a quiet brand panel beside it from 1024px up. Below that the
 * panel hides and its one promise moves under the form.
 */
export function AuthFrame({
  top,
  panel,
  promise,
  children,
}: {
  top?: React.ReactNode;
  panel: React.ReactNode;
  /** A node, not just text, so a `loading.tsx` can sketch it: the promise differs per route. */
  promise: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)]">
      <div className="flex min-w-0 flex-col px-4 pt-4 pb-5 sm:px-8 sm:py-6 lg:px-10 lg:pt-7">
        <header className="flex min-h-10 items-center justify-between gap-4">
          <Logo wordmark />
          {top ? <div className="text-sm text-muted-foreground">{top}</div> : null}
        </header>
        <main id="main" className="flex flex-1 justify-center pt-9 pb-8 sm:pt-20 sm:pb-12 lg:items-center lg:py-12">
          <div className="w-full max-w-100">
            {children}
            <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground sm:mt-8 lg:hidden">
              <CircleCheck className="size-4 shrink-0 text-success" aria-hidden />
              {promise}
            </p>
          </div>
        </main>
        <AuthFooter />
      </div>
      {panel}
    </div>
  );
}
