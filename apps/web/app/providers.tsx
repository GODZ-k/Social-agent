"use client";

import { MotionConfig } from "motion/react";
import { Toaster } from "sonner";

/** The only client-side providers the app needs: motion preferences and toasts. */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Springs become cross-fades for people who ask for reduced motion. */}
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
      <Toaster
        position="bottom-center"
        toastOptions={{
          classNames: {
            toast: "!rounded-full !border-0 !bg-foreground !text-background !shadow-floating !py-3 !px-5 !w-fit !mx-auto",
            title: "!font-medium",
          },
        }}
      />
    </>
  );
}
