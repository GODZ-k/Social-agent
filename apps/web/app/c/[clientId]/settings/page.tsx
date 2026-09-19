"use client";

import { Suspense, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useUpdateClient } from "@/lib/api/queries";
import { useWorkspace } from "@/hooks/use-workspace";
import { spring } from "@repo/ui/lib/motion";
import { PageHeader, SkeletonRows } from "@repo/ui/components/states";
import { BrandKitForm } from "@/components/onboarding/brand-kit-form";
import { SocialAccounts } from "@/components/settings/social-accounts";
import { Preferences } from "@/components/settings/preferences";
import { Segmented } from "@repo/ui/components/segmented";

const TABS = [
  { value: "brand", label: "Brand kit" },
  { value: "accounts", label: "Social accounts" },
  { value: "preferences", label: "Preferences" },
] as const;
type Tab = (typeof TABS)[number]["value"];

export default function SettingsPage() {
  return (
    // useSearchParams needs a Suspense boundary.
    <Suspense>
      <Settings />
    </Suspense>
  );
}

function Settings() {
  const { clientId, client } = useWorkspace();
  const router = useRouter();
  const pathname = usePathname();
  const param = useSearchParams().get("tab");
  // The tab lives in the URL so other screens can link straight to "connect your accounts".
  const tab: Tab = TABS.some((t) => t.value === param) ? (param as Tab) : "brand";

  const update = useUpdateClient(clientId);
  // Bumped after a save so the form remounts with the saved values as its new baseline.
  const [savedVersion, setSavedVersion] = useState(0);

  const needsConnection = client
    ? client.platforms.filter((p) => client.accounts.find((a) => a.platform === p)?.status !== "connected").length
    : 0;

  return (
    <>
      <PageHeader title="Settings" description="Change what the agent knows about this brand, and where it's allowed to publish." />

      <Segmented
        label="Settings section"
        className="mb-6"
        value={tab}
        onValueChange={(next) => router.replace(`${pathname}?tab=${next}`, { scroll: false })}
        options={TABS.map((t) => (t.value === "accounts" && needsConnection > 0 ? { ...t, count: needsConnection } : t))}
      />

      {!client ? (
        <SkeletonRows rows={4} />
      ) : (
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={spring.snappy}
          >
            {tab === "brand" && (
              <BrandKitForm
                key={savedVersion}
                variant="settings"
                url={client.url}
                scan={{ name: client.name, industry: client.industry, brand: client.brand }}
                initialPlatforms={client.platforms}
                isSaving={update.isPending}
                onSubmit={({ name, industry, brand, platforms }) =>
                  update.mutate({ name, industry, brand, platforms }, { onSuccess: () => setSavedVersion((v) => v + 1) })
                }
              />
            )}
            {tab === "accounts" && <SocialAccounts client={client} />}
            {tab === "preferences" && <Preferences client={client} />}
          </motion.div>
        </AnimatePresence>
      )}
    </>
  );
}
