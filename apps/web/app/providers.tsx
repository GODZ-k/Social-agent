"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { MotionConfig } from "motion/react";
import { Toaster } from "sonner";
import { ApiError } from "@/lib/api/client";
import { SessionGate } from "@/components/auth/session-gate";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        // A 404 won't fix itself; everything else gets two more tries.
        retry: (failures, error) =>
          !(error instanceof ApiError && error.status === 404) && failures < 2,
      },
    },
  });
}

export function Providers({ children }: { children: React.ReactNode }) {
  // One client per browser session, created lazily so it survives re-renders.
  const [queryClient] = useState(makeQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Springs become cross-fades for people who ask for reduced motion. */}
      <MotionConfig reducedMotion="user">
        <SessionGate>{children}</SessionGate>
      </MotionConfig>
      <Toaster
        position="bottom-center"
        toastOptions={{
          classNames: {
            toast: "!rounded-full !border-0 !bg-foreground !text-background !shadow-floating !py-3 !px-5 !w-fit !mx-auto",
            title: "!font-medium",
          },
        }}
      />
      <ReactQueryDevtools buttonPosition="bottom-right" />
    </QueryClientProvider>
  );
}
