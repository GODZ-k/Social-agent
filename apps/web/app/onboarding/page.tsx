"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { scanWebsite } from "@/lib/api/client";
import { useCreateClient } from "@/lib/api/queries";
import { spring } from "@/lib/motion";
import { normalizeUrl } from "@/lib/utils";
import { TopBar } from "@/components/shell/top-bar";
import { ErrorState } from "@/components/shell/states";
import { UrlForm } from "@/components/onboarding/url-form";
import { ScanProgress } from "@/components/onboarding/scan-progress";
import { BrandKitForm } from "@/components/onboarding/brand-kit-form";

export default function OnboardingPage() {
  return (
    <div className="min-h-dvh">
      <TopBar />
      <main className="mx-auto max-w-5xl px-4 pt-12 pb-24 md:px-6 md:pt-20">
        {/* useSearchParams needs a Suspense boundary to keep the shell static. */}
        <Suspense>
          <Onboarding />
        </Suspense>
      </main>
    </div>
  );
}

function Onboarding() {
  const router = useRouter();
  const initialUrl = normalizeUrl(useSearchParams().get("url") ?? "");
  const [url, setUrl] = useState(initialUrl);
  const [scanStep, setScanStep] = useState(0);

  // The scan is a read, so it is a query: it starts as soon as there is a URL
  // (including one passed from the home page), survives StrictMode remounts and
  // is never cached, because a site can change between visits.
  const scan = useQuery({
    queryKey: ["brand-scan", url],
    queryFn: () => scanWebsite(url!, setScanStep),
    enabled: !!url,
    staleTime: Infinity,
    gcTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
  });
  const createClient = useCreateClient();

  function start(target: string) {
    setScanStep(0);
    setUrl(target);
  }

  const step = !url ? "url" : scan.isSuccess ? "review" : scan.isError ? "error" : "scanning";

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={step}
        // Materialise rather than slide: the steps replace each other in place.
        initial={{ opacity: 0, scale: 0.985, filter: "blur(6px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, scale: 0.985, filter: "blur(6px)" }}
        transition={spring.smooth}
      >
        {step === "url" && (
          <div className="mx-auto max-w-xl">
            <h1 className="type-title">Which website should the agent read?</h1>
            <p className="mt-2 mb-8 text-muted-foreground">
              It looks at the pages, colours, typefaces and writing to draft a brand kit.
            </p>
            <UrlForm onSubmit={start} autoFocus />
          </div>
        )}

        {step === "scanning" && url && <ScanProgress url={url} activeIndex={scanStep} />}

        {step === "error" && scan.error && (
          <ErrorState error={scan.error} onRetry={() => { setScanStep(0); void scan.refetch(); }} />
        )}

        {step === "review" && url && scan.data && (
          <BrandKitForm
            url={url}
            scan={scan.data}
            isSaving={createClient.isPending}
            onSubmit={(input) =>
              createClient.mutate(input, {
                onSuccess: (client) => {
                  toast.success(`${client.name} added`);
                  router.push(`/c/${client.id}/strategy`);
                },
                onError: (error) => toast.error(`Couldn't save the client. ${error.message}`),
              })
            }
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
